/**
 * YouTube Data API v3 — Server-side integration
 * API key is NEVER exposed to client code.
 * All requests are server-side only.
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  duration: number; // seconds
  thumbnail: string;
  channelTitle: string;
  status: 'available' | 'unavailable' | 'private' | 'deleted' | 'live';
  publishedAt?: string;
}

export interface YouTubePlaylistInfo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnail: string;
  itemCount: number;
  publishedAt: string;
}

export interface PlaylistResult {
  playlist: YouTubePlaylistInfo;
  videos: YouTubeVideo[];
  totalDurationSeconds: number;
  availableCount: number;
  unavailableCount: number;
  liveCount: number;
  privateCount: number;
}

const YT_BASE = 'https://www.googleapis.com/youtube/v3';
const BATCH_SIZE = 50; // YouTube API max per request

/** Parse ISO 8601 duration (PT#H#M#S) to seconds */
function parseDuration(iso: string): number {
  if (!iso || iso === 'P0D') return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? '0', 10);
  const m = parseInt(match[2] ?? '0', 10);
  const s = parseInt(match[3] ?? '0', 10);
  return h * 3600 + m * 60 + s;
}

/** Choose best available thumbnail URL */
function bestThumbnail(thumbnails: Record<string, { url: string }> = {}): string {
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    ''
  );
}

/** Fetch playlist metadata */
async function fetchPlaylistInfo(playlistId: string, apiKey: string): Promise<YouTubePlaylistInfo> {
  const url = new URL(`${YT_BASE}/playlists`);
  url.searchParams.set('part', 'snippet,contentDetails');
  url.searchParams.set('id', playlistId);
  url.searchParams.set('fields', 'items(id,snippet(title,description,channelTitle,channelId,publishedAt,thumbnails),contentDetails(itemCount))');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new APIError(res.status, err?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  const item = data.items?.[0];

  if (!item) {
    throw new APIError(404, 'Playlist not found. It may be private, deleted, or the ID is incorrect.');
  }

  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description ?? '',
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnail: bestThumbnail(item.snippet.thumbnails),
    itemCount: item.contentDetails.itemCount,
    publishedAt: item.snippet.publishedAt,
  };
}

/** Fetch all video IDs from a playlist (paginated) */
async function fetchPlaylistVideoIds(
  playlistId: string,
  apiKey: string,
  onProgress?: (fetched: number, total: number) => void,
  startIndex = 1,
  endIndex = 9999
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined;
  let position = 0;

  do {
    const url = new URL(`${YT_BASE}/playlistItems`);
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('fields', 'nextPageToken,items(snippet(position),contentDetails(videoId))');
    url.searchParams.set('key', apiKey);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new APIError(res.status, err?.error?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json();

    for (const item of data.items ?? []) {
      position = (item.snippet?.position ?? position) + 1;
      // Apply range filter (1-indexed, inclusive)
      if (position >= startIndex && position <= endIndex) {
        const vid = item.contentDetails?.videoId;
        if (vid) videoIds.push(vid);
      }
      if (position > endIndex) break;
    }

    pageToken = data.nextPageToken;
    onProgress?.(videoIds.length, Math.min(endIndex - startIndex + 1, 9999));

    // Stop early if we've passed the range
    if (position > endIndex) break;
  } while (pageToken);

  return videoIds;
}

/** Fetch video details in batches of 50 */
async function fetchVideoDetails(videoIds: string[], apiKey: string): Promise<YouTubeVideo[]> {
  const videos: YouTubeVideo[] = [];

  for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
    const batch = videoIds.slice(i, i + BATCH_SIZE);
    const url = new URL(`${YT_BASE}/videos`);
    url.searchParams.set('part', 'snippet,contentDetails,status');
    url.searchParams.set('id', batch.join(','));
    url.searchParams.set(
      'fields',
      'items(id,snippet(title,channelTitle,publishedAt,thumbnails),contentDetails(duration),status(uploadStatus,privacyStatus))'
    );
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new APIError(res.status, err?.error?.message ?? `HTTP ${res.status}`);
    }

    const data = await res.json();
    const foundIds = new Set((data.items ?? []).map((i: { id: string }) => i.id));

    // Add found videos
    for (const item of data.items ?? []) {
      const uploadStatus = item.status?.uploadStatus;
      const privacy = item.status?.privacyStatus;
      const durationIso = item.contentDetails?.duration ?? 'PT0S';
      const duration = parseDuration(durationIso);

      let status: YouTubeVideo['status'] = 'available';
      if (privacy === 'private') status = 'private';
      else if (uploadStatus === 'deleted') status = 'deleted';
      else if (durationIso === 'P0D' && duration === 0) status = 'live'; // Live streams

      videos.push({
        id: item.id,
        title: item.snippet?.title ?? 'Untitled',
        duration,
        thumbnail: bestThumbnail(item.snippet?.thumbnails),
        channelTitle: item.snippet?.channelTitle ?? '',
        status,
        publishedAt: item.snippet?.publishedAt,
      });
    }

    // Mark videos not returned by API as unavailable
    for (const id of batch) {
      if (!foundIds.has(id)) {
        videos.push({
          id,
          title: 'Unavailable Video',
          duration: 0,
          thumbnail: '',
          channelTitle: '',
          status: 'unavailable',
        });
      }
    }
  }

  return videos;
}

/**
 * Main function: fetch complete playlist data
 */
export async function fetchPlaylist(
  playlistId: string,
  apiKey: string,
  options: {
    startIndex?: number;
    endIndex?: number;
    onProgress?: (fetched: number, total: number) => void;
  } = {}
): Promise<PlaylistResult> {
  const { startIndex = 1, endIndex = 9999, onProgress } = options;

  const [playlistInfo, videoIds] = await Promise.all([
    fetchPlaylistInfo(playlistId, apiKey),
    fetchPlaylistVideoIds(playlistId, apiKey, onProgress, startIndex, endIndex),
  ]);

  if (videoIds.length === 0) {
    return {
      playlist: playlistInfo,
      videos: [],
      totalDurationSeconds: 0,
      availableCount: 0,
      unavailableCount: 0,
      liveCount: 0,
      privateCount: 0,
    };
  }

  const videos = await fetchVideoDetails(videoIds, apiKey);

  // Preserve playlist order
  const idOrder = new Map(videoIds.map((id, i) => [id, i]));
  videos.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

  const availableVideos = videos.filter((v) => v.status === 'available');
  const totalDurationSeconds = availableVideos.reduce((sum, v) => sum + v.duration, 0);

  return {
    playlist: playlistInfo,
    videos,
    totalDurationSeconds,
    availableCount: availableVideos.length,
    unavailableCount: videos.filter((v) => v.status === 'unavailable').length,
    liveCount: videos.filter((v) => v.status === 'live').length,
    privateCount: videos.filter((v) => v.status === 'private').length,
  };
}

/**
 * Fetch a single video's duration
 */
export async function fetchVideo(videoId: string, apiKey: string): Promise<YouTubeVideo> {
  const url = new URL(`${YT_BASE}/videos`);
  url.searchParams.set('part', 'snippet,contentDetails,status');
  url.searchParams.set('id', videoId);
  url.searchParams.set('fields', 'items(id,snippet(title,channelTitle,publishedAt,thumbnails),contentDetails(duration),status(uploadStatus,privacyStatus))');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new APIError(res.status, err?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  const item = data.items?.[0];

  if (!item) {
    throw new APIError(404, `Video not found or is unavailable: ${videoId}`);
  }

  const duration = parseDuration(item.contentDetails?.duration ?? 'PT0S');
  return {
    id: item.id,
    title: item.snippet?.title ?? 'Untitled',
    duration,
    thumbnail: bestThumbnail(item.snippet?.thumbnails),
    channelTitle: item.snippet?.channelTitle ?? '',
    status: item.status?.privacyStatus === 'private' ? 'private' : 'available',
    publishedAt: item.snippet?.publishedAt,
  };
}

/** Structured API error */
export class APIError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}
