import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const session = await auth();
  const djId = session!.user.id;

  const [events, profile] = await Promise.all([
    prisma.event.findMany({
      where: { userId: djId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { _count: { select: { sections: true } } },
    }),
    prisma.djProfile.findUnique({ where: { userId: djId } }),
  ]);

  const stats = {
    total: await prisma.event.count({ where: { userId: djId } }),
    pending: await prisma.event.count({ where: { userId: djId, status: "PENDING" } }),
    submitted: await prisma.event.count({ where: { userId: djId, status: "SUBMITTED" } }),
  };

  return (
    <DashboardClient
      events={JSON.parse(JSON.stringify(events))}
      stats={stats}
      djName={profile?.brandName || session!.user.name || "DJ"}
    />
  );
}
