import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
};




export default async function AccountDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin?tab=overview")
  } else {
    redirect("/account/orders")
  }
}
