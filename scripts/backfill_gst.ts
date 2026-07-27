import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillGst() {
  console.log("Fetching all orders...");
  const orders = await prisma.order.findMany({
    include: { items: true },
  });

  console.log(`Found ${orders.length} orders.`);

  // Get current system settings or use defaults
  const settings = await prisma.systemSetting.findUnique({
    where: { key: "company_profile" },
  });
  
  let rates = { below1000: 5, above1000: 12, shipping: 18 };
  if (settings?.value) {
    try {
      const parsed = JSON.parse(settings.value);
      rates.below1000 = parsed.gstPercentBelow1000 ?? 5;
      rates.above1000 = parsed.gstPercentAbove1000 ?? 12;
      rates.shipping = parsed.gstPercentShipping ?? 18;
    } catch (e) {
      // Ignore
    }
  }

  let updatedCount = 0;

  for (const order of orders) {
    if (order.gstAmount > 0) continue; // Already has GST

    let calculatedGst = 0;
    const subtotalAmount = order.subtotalAmount;
    const validatedDiscount = order.discountAmount;

    if (subtotalAmount > 0) {
      order.items.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        const itemWeight = itemTotal / subtotalAmount;
        const itemDiscount = validatedDiscount * itemWeight;
        const finalItemTotal = itemTotal - itemDiscount;
        const finalItemPrice = finalItemTotal / item.quantity;
        
        const rate = finalItemPrice <= 1000 ? rates.below1000 : rates.above1000;
        calculatedGst += finalItemTotal * (rate / 100);
      });
    }
    
    calculatedGst += (order.platformFeeAmount + order.shippingAmount) * (rates.shipping / 100);
    calculatedGst = Math.round(calculatedGst * 100) / 100;

    await prisma.order.update({
      where: { id: order.id },
      data: { gstAmount: calculatedGst },
    });
    
    updatedCount++;
    console.log(`Updated Order ${order.id} with GST: ₹${calculatedGst}`);
  }

  console.log(`Backfill complete. Updated ${updatedCount} orders.`);
  await prisma.$disconnect();
}

backfillGst().catch((e) => {
  console.error(e);
  process.exit(1);
});
