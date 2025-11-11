// YouTube Integration
// Handles YouTube video parsing, metadata fetching, and transcript extraction

import type { YouTubeVideo, YouTubeTranscript, UniversalContent } from '../types/content';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate if a string is a YouTube URL or video ID
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Fetch video metadata from YouTube API
 */
export async function fetchYouTubeMetadata(videoId: string): Promise<YouTubeVideo | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return getMockYouTubeData(videoId);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,contentDetails,status&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube metadata');
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];
    
    return {
      id: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
      duration: parseYouTubeDuration(video.contentDetails.duration),
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      hasTranscript: true // We'll check this separately
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return getMockYouTubeData(videoId);
  }
}

/**
 * Parse YouTube duration format (PT1H30M15S) to seconds
 */
function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Fetch YouTube video transcript/captions
 * Note: This requires a backend proxy as YouTube doesn't provide direct transcript API
 */
export async function fetchYouTubeTranscript(videoId: string): Promise<YouTubeTranscript | null> {
  // In production, this would call a backend endpoint that uses youtube-transcript library
  // For now, return mock data
  return getMockTranscript(videoId);
}

/**
 * Check if transcript is available for a video
 */
export async function hasYouTubeTranscript(videoId: string): Promise<boolean> {
  try {
    // This would need to be a backend call
    // For now, assume most educational videos have transcripts
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Convert YouTube video to UniversalContent
 */
export function convertYouTubeToContent(
  video: YouTubeVideo,
  linkedTo: UniversalContent['linkedTo'] = {}
): UniversalContent {
  return {
    id: `youtube-${video.id}`,
    source: 'youtube',
    type: 'video',
    name: video.title,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    metadata: {
      mimeType: 'video/youtube',
      duration: video.duration,
      thumbnail: video.thumbnailUrl,
      author: video.channelTitle,
      lastModified: video.publishedAt,
      transcriptAvailable: video.hasTranscript
    },
    linkedTo,
    tags: ['video', 'youtube'],
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString()
  };
}

/**
 * Process YouTube URL and create UniversalContent
 */
export async function processYouTubeUrl(
  url: string,
  linkedTo: UniversalContent['linkedTo'] = {}
): Promise<UniversalContent | null> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  const metadata = await fetchYouTubeMetadata(videoId);
  if (!metadata) return null;

  return convertYouTubeToContent(metadata, linkedTo);
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string, startTime?: number): string {
  let url = `https://www.youtube.com/embed/${videoId}`;
  if (startTime) {
    url += `?start=${Math.floor(startTime)}`;
  }
  return url;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality === 'maxres' ? 'maxresdefault' : quality + 'default'}.jpg`;
}

// Mock data for development/demo
function getMockYouTubeData(videoId: string): YouTubeVideo {
  return {
    id: videoId,
    title: 'Educational Video - Advanced Calculus Lecture',
    description: 'Comprehensive lecture covering integration techniques, substitution methods, and applications of calculus in real-world scenarios.',
    thumbnailUrl: getYouTubeThumbnail(videoId, 'high'),
    duration: 2847, // 47:27
    channelTitle: 'Academic Channel',
    publishedAt: new Date().toISOString(),
    hasTranscript: true
  };
}

function getMockTranscript(videoId: string): YouTubeTranscript {
  return {
    videoId,
    language: 'en',
    segments: [
      {
        text: 'Welcome to today\'s lecture on advanced integration techniques.',
        start: 0,
        duration: 4
      },
      {
        text: 'We\'ll begin by reviewing the fundamental theorem of calculus.',
        start: 4,
        duration: 5
      },
      {
        text: 'Integration by substitution is a powerful method for solving complex integrals.',
        start: 9,
        duration: 6
      },
      {
        text: 'Let\'s look at an example to see how this works in practice.',
        start: 15,
        duration: 4
      }
    ]
  };
}

/**
 * Search YouTube videos (requires API key)
 */
export async function searchYouTube(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to search YouTube');
    }

    const data = await response.json();
    
    const videos: YouTubeVideo[] = await Promise.all(
      data.items.map(async (item: any) => {
        const metadata = await fetchYouTubeMetadata(item.id.videoId);
        return metadata!;
      })
    );

    return videos.filter(v => v !== null);
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

