import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Fetch oEmbed data from TikTok
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch TikTok oEmbed');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      thumbnail: data.thumbnail_url || null,
      title: data.title || null,
    });
  } catch (error) {
    console.error('Error fetching TikTok oEmbed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch TikTok data' },
      { status: 500 }
    );
  }
}

