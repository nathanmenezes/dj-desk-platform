import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TemplatesClient } from "./client";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [templates, djProfile] = await Promise.all([
    prisma.template.findMany({
      where: { OR: [{ isDefault: true }, { userId: session.user.id }] },
      include: { sections: { orderBy: { order: "asc" } } },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    prisma.djProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  return <TemplatesClient templates={templates} djName={djProfile?.brandName || session.user.name || "DJ"} />;
}

