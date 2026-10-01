/**
 * YouTube URL Parser
 * Supports all known YouTube URL formats and extracts identifiers
 */

export type YouTubeInputType = 'playlist' | 'video' | 'channel' | 'unknown';

export interface ParsedYouTubeInput {
  type: YouTubeInputType;
  id: string;
  raw: string;
  error?: string;
}

// All known YouTube playlist URL patterns
const PLAYLIST_PATTERNS = [
  /[?&]list=(PL[A-Za-z0-9_-]{16,})/,
  /[?&]list=(FL[A-Za-z0-9_-]{16,})/,
  /[?&]list=(UU[A-Za-z0-9_-]{16,})/,
  /[?&]list=(WL)/,
  /[?&]list=(LL)/,
  /[?&]list=(RD[A-Za-z0-9_-]+)/,
  /^(PL[A-Za-z0-9_-]{16,})$/, // Raw playlist ID
];

// YouTube video ID pattern (11 chars: letters, digits, -, _)
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

// Channel patterns
const CHANNEL_PATTERNS = [
  /youtube\.com\/@([A-Za-z0-9_.-]+)/, // @handle
  /youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})/, // /channel/UCxxx
  /youtube\.com\/c\/([A-Za-z0-9_.-]+)/, // /c/name (legacy)
  /youtube\.com\/user\/([A-Za-z0-9_.-]+)/, // /user/name (legacy)
];

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/, // Raw video ID
  ];

  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractPlaylistId(url: string): string | null {
  for (const p of PLAYLIST_PATTERNS) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractChannelIdentifier(url: string): { type: 'handle' | 'id' | 'name'; value: string } | null {
  for (let i = 0; i < CHANNEL_PATTERNS.length; i++) {
    const m = url.match(CHANNEL_PATTERNS[i]);
    if (m) {
      const types: Array<'handle' | 'id' | 'name'> = ['handle', 'id', 'name', 'name'];
      return { type: types[i], value: m[1] };
    }
  }
  return null;
}

/**
 * Parse a single YouTube URL or ID into a structured result
 */
export function parseYouTubeUrl(raw: string): ParsedYouTubeInput {
  const input = raw.trim();

  if (!input) {
    return { type: 'unknown', id: '', raw: input, error: 'Empty input' };
  }

  // Playlist ID takes priority (even if URL also has a video ID)
  const playlistId = extractPlaylistId(input);
  if (playlistId) {
    return { type: 'playlist', id: playlistId, raw: input };
  }

  // Check for channel URL
  const channel = extractChannelIdentifier(input);
  if (channel) {
    return { type: 'channel', id: channel.value, raw: input };
  }

  // Check for single video
  const videoId = extractVideoId(input);
  if (videoId && VIDEO_ID_PATTERN.test(videoId)) {
    return { type: 'video', id: videoId, raw: input };
  }

  return {
    type: 'unknown',
    id: '',
    raw: input,
    error: `Could not identify a valid YouTube playlist, video, or channel URL in: "${input.slice(0, 100)}"`,
  };
}

/**
 * Parse one or more URLs from a multi-line textarea input
 */
export function parseMultipleUrls(text: string): ParsedYouTubeInput[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map(parseYouTubeUrl)
    .filter((result, index, self) => {
      // Deduplicate by type+id
      return index === self.findIndex((r) => r.type === result.type && r.id === result.id);
    });
}
