import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await prisma.template.findFirst({
    where: { id, userId: session.user.id, isDefault: false },
  });

  if (!template) return NextResponse.json({ error: "Not found or cannot delete default" }, { status: 404 });

  await prisma.template.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
