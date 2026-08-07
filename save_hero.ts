import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const newHtml = fs.readFileSync('hero.html', 'utf8');
  await prisma.systemSetting.upsert({
    where: { key: "HOME2_HERO_HTML" },
    update: { value: newHtml },
    create: { key: "HOME2_HERO_HTML", value: newHtml }
  });
  console.log("Saved updated hero.html to database");
}
main().catch(console.error).finally(() => prisma.$disconnect());
