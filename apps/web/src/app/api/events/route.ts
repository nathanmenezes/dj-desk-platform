import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEventSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  clientName: z.string().min(1, "Nome do cliente obrigatório"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  eventDate: z.string().optional(),
  deadline: z.string().optional(),
  templateId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") as "PENDING" | "SUBMITTED" | "EXPIRED" | null;

  const where = {
    userId: session.user.id,
    ...(status ? { status } : {}),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { sections: true } } },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({ events, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, clientName, clientEmail, eventDate, deadline, templateId } = parsed.data;

  // Load template sections if provided
  let templateSections: { name: string; order: number }[] = [];
  if (templateId) {
    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        OR: [{ userId: session.user.id }, { isDefault: true }],
      },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    if (template) {
      templateSections = template.sections.map((s) => ({ name: s.name, order: s.order }));
    }
  }

  const event = await prisma.event.create({
    data: {
      name,
      clientName,
      clientEmail: clientEmail || null,
      userId: session.user.id,
      sections: {
        create: templateSections.map((s) => ({
          name: s.name,
          order: s.order,
        })),
      },
      ...(eventDate ? { eventDate: new Date(eventDate) } : {}),
      ...(deadline ? { deadline: new Date(deadline) } : {}),
    },
  });

  return NextResponse.json(event, { status: 201 });
}
