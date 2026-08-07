import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const carouselRecord = await prisma.systemSetting.findUnique({ where: { key: "HOME2_CAROUSEL_HTML" } });
  if (carouselRecord) {
    console.log(carouselRecord.value.substring(0, 500));
  } else {
    console.log("Not found");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
