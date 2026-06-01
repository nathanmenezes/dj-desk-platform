import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PlaylistClient } from "./client";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  const event = await prisma.event.findUnique({
    where: { id: uuid },
    include: {
      user: {
        include: { profile: true },
      },
      sections: {
        orderBy: { order: "asc" },
        include: { songs: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!event) notFound();
  if (event.status === "EXPIRED") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">⏰</p>
          <h1 className="font-display font-bold text-xl text-[var(--text)] mb-2">
            Link expirado
          </h1>
          <p className="text-[var(--subtle)] text-sm">
            O prazo para enviar a playlist já passou.
          </p>
        </div>
      </div>
    );
  }

  const djProfile = event.user.profile;
  const brandColor = djProfile?.primaryColor || "#C8F135";
  const brandName = djProfile?.brandName || event.user.name;
  const logoUrl = djProfile?.logoUrl ?? null;

  return (
    <PlaylistClient
      event={JSON.parse(JSON.stringify(event))}
      brand={{ name: brandName, color: brandColor, logoUrl }}
    />
  );
}
