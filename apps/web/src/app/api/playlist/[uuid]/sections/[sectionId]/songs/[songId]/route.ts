import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ uuid: string; sectionId: string; songId: string }> }
) {
  const { uuid, sectionId, songId } = await params;

  const event = await prisma.event.findUnique({ where: { id: uuid } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.status !== "PENDING") {
    return NextResponse.json({ error: "Event is not accepting changes" }, { status: 400 });
  }

  await prisma.songEntry.deleteMany({ where: { id: songId, sectionId } });

  return new NextResponse(null, { status: 204 });
}
