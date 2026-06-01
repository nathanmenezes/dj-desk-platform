import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  source: "SPOTIFY" | "YOUTUBE";
  spotifyUrl: string | null;
  youtubeUrl: string | null;
};

let spotifyToken: { access_token: string; expires_at: number } | null = null;

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret || clientId === "your-spotify-client-id") return null;

  if (spotifyToken && Date.now() < spotifyToken.expires_at) {
    return spotifyToken.access_token;
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) return null;
  const data = await res.json();
  spotifyToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000 - 60_000,
  };
  return spotifyToken.access_token;
}

async function searchSpotify(q: string): Promise<SearchResult[]> {
  const token = await getSpotifyToken();
  if (!token) return [];

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.tracks?.items || []).map(
    (track: {
      id: string;
      name: string;
      artists: { name: string }[];
      album: { images: { url: string }[] };
      external_urls: { spotify: string };
    }) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      coverUrl: track.album.images[1]?.url || track.album.images[0]?.url || null,
      source: "SPOTIFY" as const,
      spotifyUrl: track.external_urls.spotify,
      youtubeUrl: null,
    })
  );
}

async function searchYouTube(q: string): Promise<SearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "your-youtube-api-key") return [];

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoCategoryId=10&maxResults=10&key=${apiKey}`
  );
  if (!res.ok) return [];

  const data = await res.json();
  return (data.items || []).map(
    (item: {
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
      };
    }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      coverUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || null,
      source: "YOUTUBE" as const,
      spotifyUrl: null,
      youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    })
  );
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  // Try Spotify first, fall back to YouTube
  let results = await searchSpotify(q);
  if (results.length === 0) {
    results = await searchYouTube(q);
  }

  return NextResponse.json({ results });
}
