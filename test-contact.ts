import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const query = await prisma.contactQuery.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        phone: "",
        subject: "General Inquiry",
        orderId: null,
        userId: "test_user_id",
        messages: {
          create: {
            senderType: "CUSTOMER",
            message: "Hello this is a test"
          }
        }
      }
    });
    console.log("ContactQuery created:", query.id);

    const notif = await prisma.adminNotification.create({
      data: {
        type: "QUERY",
        message: `New General Inquiry from Test User (test@example.com)`,
        link: `/admin/queries/${query.id}`,
      }
    });
    console.log("AdminNotification created:", notif.id);

  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
