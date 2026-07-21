import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserAddresses } from "@/actions/address"
import AddressSelector from "./address-selector"

export default async function CheckoutAddressPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login?from=/checkout/address")
  }

  const addresses = await getUserAddresses()

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-8 text-center">
        Shipping Address
      </h1>
      
      <AddressSelector initialAddresses={addresses} />
    </div>
  )
}
