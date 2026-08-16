import prisma from "./src/lib/prisma";

async function main() {
  const products = await prisma.product.findMany({
    take: 1,
    include: { images: true }
  });
  console.log("Images: ", products[0].images);
}

main().catch(console.error).finally(() => prisma.$disconnect());
