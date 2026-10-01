/**
 * API Route: GET /api/playlist
 * 
 * Query params:
 *   - id: playlist ID (required for playlist)
 *   - vid: video ID (required for single video)
 *   - start: range start (default 1)
 *   - end: range end (default 9999)
 *   - userKey: optional user-provided API key (not stored, not logged)
 * 
 * SECURITY: The YOUTUBE_API_KEY env var is NEVER sent to the client.
 * User-provided keys are only held in memory for the duration of the request.
 */

import type { APIRoute } from 'astro';
import { fetchPlaylist, fetchVideo, APIError } from '../../lib/youtube-api';
import { parseYouTubeUrl } from '../../lib/youtube-parser';
import { playlistCache, videoCache, playlistCacheKey, videoCacheKey, TTL } from '../../lib/cache';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

function errorResponse(status: number, code: string, message: string, details?: string) {
  return new Response(
    JSON.stringify({ error: { code, message, details } }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}

function successResponse(data: unknown, cacheable = true) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheable ? 'public, max-age=3600, stale-while-revalidate=7200' : 'no-store',
    },
  });
}

export const GET: APIRoute = async ({ request, url }) => {
  // Rate limiting
  const ip = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return errorResponse(
      429,
      'RATE_LIMITED',
      'Too many requests. Please wait a minute before trying again.',
      'You have exceeded 20 requests per minute.'
    );
  }

  // Get API key (server env preferred, user-provided as fallback)
  const serverKey = import.meta.env.YOUTUBE_API_KEY as string | undefined;
  const userKey = url.searchParams.get('userKey');

  // SECURITY: only use user key if server key is unavailable
  const apiKey = serverKey?.trim() || userKey?.trim();

  if (!apiKey) {
    return errorResponse(
      503,
      'NO_API_KEY',
      'The calculator is temporarily unavailable.',
      'No YouTube API key is configured. Please try again later or provide your own API key.'
    );
  }

  const rawUrl = url.searchParams.get('url') ?? '';
  const startParam = parseInt(url.searchParams.get('start') ?? '1', 10);
  const endParam = parseInt(url.searchParams.get('end') ?? '9999', 10);

  if (!rawUrl) {
    return errorResponse(400, 'MISSING_URL', 'Please provide a YouTube URL to calculate.');
  }

  if (rawUrl.length > 2000) {
    return errorResponse(400, 'URL_TOO_LONG', 'URL is too long. Please provide a valid YouTube URL.');
  }

  const start = Math.max(1, isNaN(startParam) ? 1 : startParam);
  const end = Math.min(9999, isNaN(endParam) ? 9999 : endParam);

  if (start > end) {
    return errorResponse(
      400,
      'INVALID_RANGE',
      `Invalid range: start (${start}) must be less than end (${end}).`
    );
  }

  // Parse the input URL
  const parsed = parseYouTubeUrl(rawUrl);

  try {
    if (parsed.type === 'playlist') {
      const cacheKey = playlistCacheKey(parsed.id, start, end);
      const cached = playlistCache.get(cacheKey);
      if (cached) {
        return successResponse({ type: 'playlist', cached: true, data: cached });
      }

      const result = await fetchPlaylist(parsed.id, apiKey, { startIndex: start, endIndex: end });
      playlistCache.set(cacheKey, result, TTL.ONE_HOUR);

      return successResponse({ type: 'playlist', cached: false, data: result });

    } else if (parsed.type === 'video') {
      const cacheKey = videoCacheKey(parsed.id);
      const cached = videoCache.get(cacheKey);
      if (cached) {
        return successResponse({ type: 'video', cached: true, data: cached });
      }

      const video = await fetchVideo(parsed.id, apiKey);
      videoCache.set(cacheKey, video, TTL.ONE_DAY);

      return successResponse({ type: 'video', cached: false, data: video });

    } else if (parsed.type === 'unknown') {
      return errorResponse(
        400,
        'INVALID_URL',
        parsed.error ?? 'Could not identify a valid YouTube URL.',
        'Supported formats: playlist URL, video URL, youtu.be link, playlist ID, video ID'
      );
    } else {
      return errorResponse(
        400,
        'UNSUPPORTED_TYPE',
        'Channel URLs are not yet supported. Please provide a playlist URL instead.',
        'Try using a playlist from this channel instead.'
      );
    }
  } catch (err) {
    if (err instanceof APIError) {
      if (err.status === 403) {
        if (err.message.includes('quota')) {
          return errorResponse(
            503,
            'QUOTA_EXCEEDED',
            'YouTube API quota has been exceeded. Please try again tomorrow or provide your own API key.',
            'YouTube limits the number of API requests per day.'
          );
        }
        return errorResponse(
          403,
          'API_FORBIDDEN',
          'Access was denied by YouTube API.',
          err.message
        );
      }
      if (err.status === 404) {
        return errorResponse(
          404,
          'NOT_FOUND',
          'Playlist or video not found.',
          err.message
        );
      }
      return errorResponse(
        err.status >= 500 ? 502 : 400,
        'YOUTUBE_API_ERROR',
        'YouTube API returned an error.',
        err.message
      );
    }

    // Network or unexpected errors
    console.error('[API /playlist] Unexpected error:', err);
    return errorResponse(
      500,
      'INTERNAL_ERROR',
      'Something went wrong on our end. Please try again.',
      'If this persists, please contact us.'
    );
  }
};

// Block non-GET methods
export const POST: APIRoute = () =>
  errorResponse(405, 'METHOD_NOT_ALLOWED', 'Only GET requests are accepted.');
