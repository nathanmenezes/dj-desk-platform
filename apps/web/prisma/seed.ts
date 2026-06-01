import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES = [
  {
    name: "Casamento Completo",
    sections: [
      "Chegada dos Convidados",
      "Entrada dos Padrinhos",
      "Entrada da Noiva",
      "Cerimônia",
      "Saída dos Noivos",
      "Coquetel",
      "Jantar",
      "Pista de Dança",
      "Valsa dos Noivos",
      "Encerramento",
    ],
  },
  {
    name: "Festa de 15 Anos",
    sections: [
      "Chegada dos Convidados",
      "Entrada da Debutante",
      "Valsa de Abertura",
      "Valsa dos Pais",
      "Jantar",
      "Show / Surpresa",
      "Pista de Dança",
      "Encerramento",
    ],
  },
  {
    name: "Formatura",
    sections: [
      "Recepção",
      "Entrada dos Formandos",
      "Jantar",
      "Discursos",
      "Pista de Dança",
      "Encerramento",
    ],
  },
  {
    name: "Festa Corporativa",
    sections: [
      "Recepção / Networking",
      "Jantar / Confraternização",
      "Premiações",
      "Pista de Dança",
      "Encerramento",
    ],
  },
  {
    name: "Aniversário",
    sections: [
      "Chegada dos Convidados",
      "Jantar",
      "Parabéns",
      "Pista de Dança",
      "Encerramento",
    ],
  },
];

async function main() {
  console.log("🌱 Seeding default templates...");

  for (const template of DEFAULT_TEMPLATES) {
    const existing = await prisma.template.findFirst({
      where: { name: template.name, isDefault: true },
    });
    if (existing) continue;

    await prisma.template.create({
      data: {
        name: template.name,
        isDefault: true,
        sections: {
          create: template.sections.map((name, order) => ({ name, order })),
        },
      },
    });
    console.log(`  ✓ ${template.name}`);
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
