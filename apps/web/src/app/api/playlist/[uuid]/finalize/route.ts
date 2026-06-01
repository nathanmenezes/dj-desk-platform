import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  const event = await prisma.event.findUnique({
    where: { id: uuid },
    include: { user: true },
  });

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.status !== "PENDING") {
    return NextResponse.json({ error: "Already finalized" }, { status: 400 });
  }

  // Mark event as submitted
  const updated = await prisma.event.update({
    where: { id: uuid },
    data: { status: "SUBMITTED" },
  });

  // Create in-app notification for the DJ
  await prisma.notification.create({
    data: {
      userId: event.userId,
      eventId: event.id,
      message: `${event.clientName} finalizou a playlist para "${event.name}"`,
    },
  });

  // TODO: send email notification (next iteration)

  return NextResponse.json(updated);
}
