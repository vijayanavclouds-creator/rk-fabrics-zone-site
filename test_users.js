const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, role: true }});
  const coupons = await prisma.coupon.findMany();
  console.log("Users:", users);
  console.log("Coupons:", coupons);
}
run();
