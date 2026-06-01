import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EventDetailClient } from "./client";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const event = await prisma.event.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { songs: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!event) notFound();

  return <EventDetailClient event={JSON.parse(JSON.stringify(event))} />;
}
