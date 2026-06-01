import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { songs: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rows = ["Secao,Ordem,Titulo,Artista,Fonte,Link"];

  for (const section of event.sections) {
    for (let i = 0; i < section.songs.length; i++) {
      const song = section.songs[i];
      const link = song.spotifyUrl || song.youtubeUrl || "";
      const cells = [section.name, String(i + 1), song.title, song.artist, song.source, link];
      rows.push(cells.map((v) => '"' + v.replace(/"/g, '""') + '"').join(","));
    }
  }

  const csv = rows.join("\n");
  const filename = event.name.replace(/[^a-z0-9]/gi, "_") + "_playlist.csv";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="' + filename + '"',
    },
  });
}