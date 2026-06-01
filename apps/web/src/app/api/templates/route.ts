import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.template.findMany({
    where: {
      OR: [{ userId: session.user.id }, { isDefault: true }],
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    select: { id: true, name: true, isDefault: true },
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, sections } = body as { name: string; sections: string[] };

  if (!name?.trim() || !Array.isArray(sections) || sections.length === 0) {
    return NextResponse.json({ error: "name and sections required" }, { status: 400 });
  }

  const template = await prisma.template.create({
    data: {
      name: name.trim(),
      userId: session.user.id,
      isDefault: false,
      sections: {
        create: sections.map((sectionName, order) => ({ name: sectionName, order })),
      },
    },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(template, { status: 201 });
}
