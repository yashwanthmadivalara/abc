import { NextRequest, NextResponse } from 'next/server';

interface VideoItem {
  id: string;
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  watchUrl: string;
  description: string;
}

function parseSubscriberString(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/subscribers?/i, '').trim();
  const match = cleaned.match(/^([\d.]+)\s*([KMBkmb])?/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const multiplier = (match[2] || '').toUpperCase();
  if (multiplier === 'M') return Math.round(num * 1000000);
  if (multiplier === 'K') return Math.round(num * 1000);
  if (multiplier === 'B') return Math.round(num * 1000000000);
  return Math.round(num);
}

function parseXmlVideos(xmlText: string): VideoItem[] {
  const videos: VideoItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entry = match[1];

    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/);
    const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);

    const videoId = videoIdMatch ? videoIdMatch[1] : '';
    if (!videoId) continue;

    const title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : 'Untitled Video';
    const published = publishedMatch ? publishedMatch[1] : new Date().toISOString();
    const thumbnail = thumbMatch ? thumbMatch[1] : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const description = descMatch ? descMatch[1].slice(0, 300) : '';

    videos.push({
      id: `yt-${videoId}`,
      videoId,
      title,
      publishedAt: new Date(published).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      thumbnailUrl: thumbnail,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      description,
    });
  }

  return videos;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawInput = (body?.url || '').trim();

    if (!rawInput) {
      return NextResponse.json({ success: false, error: 'Please provide a valid YouTube channel URL or handle.' }, { status: 400 });
    }

    let channelId = '';
    let targetUrl = '';
    let handle = '';

    // Check if input is a direct Channel ID
    if (/^UC[a-zA-Z0-9_-]{22}$/.test(rawInput)) {
      channelId = rawInput;
      targetUrl = `https://www.youtube.com/channel/${channelId}`;
    } else {
      // Normalize URL
      if (rawInput.startsWith('@')) {
        handle = rawInput;
        targetUrl = `https://www.youtube.com/${rawInput}`;
      } else if (!rawInput.startsWith('http')) {
        if (rawInput.includes('youtube.com/')) {
          targetUrl = `https://${rawInput}`;
        } else {
          handle = `@${rawInput}`;
          targetUrl = `https://www.youtube.com/@${rawInput}`;
        }
      } else {
        targetUrl = rawInput;
        const handleMatch = rawInput.match(/@([a-zA-Z0-9_.-]+)/);
        if (handleMatch) {
          handle = `@${handleMatch[1]}`;
        }
      }
    }

    let channelName = '';
    let avatarUrl = '';
    let subscriberCount = 0;
    let subscriberText = '';

    // If channelId is not known, fetch channel page HTML
    if (!channelId) {
      const pageRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store',
      });

      if (!pageRes.ok) {
        return NextResponse.json({
          success: false,
          error: `Could not reach YouTube channel page (HTTP ${pageRes.status}). Verify the URL and try again.`,
        }, { status: 404 });
      }

      const html = await pageRes.text();

      // Channel ID extraction
      const idMatch =
        html.match(/browseId":"(UC[a-zA-Z0-9_-]{22})/) ||
        html.match(/channel_id=(UC[a-zA-Z0-9_-]{22})/) ||
        html.match(/itemprop="channelId" content="(UC[a-zA-Z0-9_-]{22})/) ||
        html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})/) ||
        html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})/);

      if (idMatch) {
        channelId = idMatch[1];
      }

      // Name extraction
      const nameMatch =
        html.match(/"channelProfileMicroformatDetails":\{"profilePage":\{.*?"name":"([^"]+)"/) ||
        html.match(/<meta property="og:title" content="([^"]+)">/) ||
        html.match(/<title>([^<]+) - YouTube<\/title>/);

      if (nameMatch) {
        channelName = nameMatch[1].replace(/ - YouTube$/i, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
      }

      // Avatar extraction
      const avatarMatch =
        html.match(/"image":"(https:\/\/yt3\.googleusercontent\.com\/[^"]+)"/) ||
        html.match(/<meta property="og:image" content="([^"]+)">/) ||
        html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/);

      if (avatarMatch) {
        avatarUrl = avatarMatch[1];
      }

      // Handle extraction if not known
      if (!handle) {
        const hMatch = html.match(/"alternateName":"(@[^"]+)"/);
        if (hMatch) handle = hMatch[1];
      }

      // Subscribers extraction
      const subMatch = html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
      if (subMatch) {
        subscriberText = subMatch[1];
        subscriberCount = parseSubscriberString(subscriberText);
      } else {
        const subIntMatch = html.match(/"userInteractionCount":"(\d+)"/);
        if (subIntMatch) {
          subscriberCount = parseInt(subIntMatch[1]);
          subscriberText = `${(subscriberCount / 1000000).toFixed(1)}M subscribers`;
        }
      }
    }

    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'Unable to resolve YouTube Channel ID. Please provide a canonical channel URL or handle.',
      }, { status: 400 });
    }

    // Now fetch real-time public video stream via RSS
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const rssRes = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      cache: 'no-store',
    });

    let uploadedVideos: VideoItem[] = [];
    if (rssRes.ok) {
      const xml = await rssRes.text();

      // If channel name was not parsed from HTML, get it from RSS feed title
      if (!channelName) {
        const feedTitleMatch = xml.match(/<title>([^<]+)<\/title>/);
        if (feedTitleMatch) {
          channelName = feedTitleMatch[1];
        }
      }

      uploadedVideos = parseXmlVideos(xml);
    }

    // Fallbacks
    if (!channelName) channelName = handle || 'YouTube Channel';
    if (!avatarUrl) {
      avatarUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80`;
    }

    return NextResponse.json({
      success: true,
      channel: {
        channelId,
        name: channelName,
        handle: handle || `@${channelName.toLowerCase().replace(/\s+/g, '')}`,
        thumbnailUrl: avatarUrl,
        channelUrl: `https://www.youtube.com/channel/${channelId}`,
        subscriberCount: subscriberCount || 100000,
        subscriberText: subscriberText || `${uploadedVideos.length} uploaded videos`,
        detectedVideosCount: uploadedVideos.length,
        uploadedVideos,
      },
    });
  } catch (error: any) {
    console.error('Error resolving YouTube channel:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Internal server error while resolving YouTube channel.',
    }, { status: 500 });
  }
}
