import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.order.updateMany({ data: { isReadByAdmin: true } });
    console.log('success');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
