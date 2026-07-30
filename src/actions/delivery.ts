"use server"

import { checkPincodeServiceability, generateBlueDartWaybill } from "@/lib/bluedart"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function checkDeliveryAvailability(pincode: string) {
  try {
    const result = await checkPincodeServiceability(pincode)
    return result
  } catch (error) {
    console.error("Error checking delivery availability:", error)
    return { isServiceable: false, message: "Failed to check delivery availability" }
  }
}

export async function generateAWB(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) return { success: false, error: "Order not found" }
    if (order.waybillGenerated && order.awbNumber) {
      return { success: false, error: "Waybill already generated" }
    }

    const result = await generateBlueDartWaybill(order)
    
    if (result.success && result.awbNumber) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          waybillGenerated: true,
          awbNumber: result.awbNumber,
          shippingProvider: "BLUEDART",
          status: order.status === "CONFIRMED" ? "PROCESSING" : order.status // Optionally auto-update status
        }
      })
      
      revalidatePath(`/admin/orders/user/${order.userId}`)
      return { success: true, awbNumber: result.awbNumber }
    } else {
      return { success: false, error: result.error || "Failed to generate AWB" }
    }
  } catch (error: any) {
    console.error("Error generating AWB:", error)
    return { success: false, error: error.message || "Failed to generate AWB" }
  }
}
