import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { brandName, logoUrl, primaryColor } = body as {
    brandName?: string;
    logoUrl?: string;
    primaryColor?: string;
  };

  const profile = await prisma.djProfile.upsert({
    where: { userId: session.user.id },
    update: {
      ...(brandName !== undefined ? { brandName } : {}),
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      ...(primaryColor !== undefined ? { primaryColor } : {}),
    },
    create: {
      userId: session.user.id,
      brandName: brandName ?? null,
      logoUrl: logoUrl ?? null,
      primaryColor: primaryColor ?? "#C8F135",
    },
  });

  return NextResponse.json(profile);
}

