import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  let profile = await prisma.djProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    profile = await prisma.djProfile.create({
      data: { userId: session.user.id },
    });
  }

  return (
    <SettingsClient
      profile={{
        brandName: profile.brandName,
        logoUrl: profile.logoUrl,
        primaryColor: profile.primaryColor,
      }}
      userEmail={session.user.email ?? ""}
    />
  );
}

