import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const carouselRecord = await prisma.systemSetting.findUnique({ where: { key: "HOME2_CAROUSEL_HTML" } });
  if (carouselRecord) {
    fs.writeFileSync('carousel.html', carouselRecord.value);
    console.log("Saved carousel.html");
  } else {
    console.log("Not found");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
