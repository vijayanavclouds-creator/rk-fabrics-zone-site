import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendReturnRequestedEmail, sendAdminReturnNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, items, reasons, description, refundMethod, refundDetails } = body;

    if (!orderId || !items || !items.length || !reasons || !reasons.length || !refundMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id },
      include: { items: true, user: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "DELIVERED") {
      return NextResponse.json({ error: "Only delivered orders can be returned" }, { status: 400 });
    }

    if (order.deliveredAt) {
      const returnDaysLimit = 7;
      const deliveryDate = new Date(order.deliveredAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - deliveryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > returnDaysLimit) {
         return NextResponse.json({ error: "Return window has closed" }, { status: 400 });
      }
    }

    const existingReturn = await prisma.returnRequest.findUnique({
      where: { orderId: orderId }
    });

    if (existingReturn) {
      return NextResponse.json({ error: "A return request already exists for this order" }, { status: 400 });
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        userId: session.user.id,
        items,
        reasons,
        description,
        refundMethod,
        refundDetails
      }
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "RETURN_REQUESTED" }
    });

    // Create system notification for admin
    await prisma.adminNotification.create({
      data: {
        type: "RETURN",
        message: `New return request for Order #${order.id.slice(-8).toUpperCase()} from ${order.user.name}`,
        link: `/admin/orders/user/${order.userId}?expanded=${order.id}`
      }
    });

    await prisma.adminActivity.create({
      data: {
        adminName: "System",
        action: "Return Request Submitted",
        details: `Customer ${order.user.name} submitted a return request for Order #${order.id.slice(-8).toUpperCase()}`
      }
    });

    // Send emails
    await Promise.all([
      sendReturnRequestedEmail(order, returnRequest),
      sendAdminReturnNotification(order, returnRequest)
    ]);

    return NextResponse.json({ success: true, returnRequest });

  } catch (error: any) {
    console.error("Return Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
