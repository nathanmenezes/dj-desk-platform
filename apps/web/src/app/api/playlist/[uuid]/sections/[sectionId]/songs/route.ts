import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addSongSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  coverUrl: z.string().nullable().optional(),
  source: z.enum(["SPOTIFY", "YOUTUBE"]),
  spotifyUrl: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string; sectionId: string }> }
) {
  const { uuid, sectionId } = await params;

  const event = await prisma.event.findUnique({ where: { id: uuid } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.status !== "PENDING") {
    return NextResponse.json({ error: "Event is not accepting changes" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = addSongSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, artist, coverUrl, source, spotifyUrl, youtubeUrl } = parsed.data;

  const count = await prisma.songEntry.count({ where: { sectionId } });

  const song = await prisma.songEntry.create({
    data: {
      sectionId,
      title,
      artist,
      coverUrl: coverUrl || null,
      source,
      spotifyUrl: spotifyUrl || null,
      youtubeUrl: youtubeUrl || null,
      order: count,
    },
  });

  return NextResponse.json(song, { status: 201 });
}
