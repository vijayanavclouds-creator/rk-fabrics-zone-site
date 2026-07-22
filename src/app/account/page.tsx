import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"


export default async function AccountDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
    redirect("/account/admin?tab=overview")
  } else {
    redirect("/account/orders")
  }
}
