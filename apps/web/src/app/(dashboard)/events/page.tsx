import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventsClient } from "./client";

export default async function EventsPage() {
  const session = await auth();

  const events = await prisma.event.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sections: true } } },
  });

  return <EventsClient events={JSON.parse(JSON.stringify(events))} />;
}
