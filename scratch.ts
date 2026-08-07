import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const heroRecord = await prisma.systemSetting.findUnique({ where: { key: "HOME2_HERO_HTML" } });
  if (heroRecord) {
    fs.writeFileSync('hero.html', heroRecord.value);
    console.log("Saved hero.html");
  } else {
    console.log("Not found");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
