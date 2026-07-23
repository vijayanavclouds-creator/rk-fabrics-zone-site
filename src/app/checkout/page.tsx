import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function CheckoutIndex() {
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { addresses: true }
      })

      if (user && user.addresses && user.addresses.length > 0) {
        redirect("/checkout/payment")
      }
    } catch (e) {
      console.error("Error fetching user addresses for checkout redirect:", e)
    }
  }

  redirect("/checkout/address")
}
