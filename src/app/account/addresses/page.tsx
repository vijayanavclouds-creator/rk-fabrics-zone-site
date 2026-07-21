import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserAddresses } from "@/actions/address"
import AddressSelector from "@/app/checkout/address/address-selector"

export default async function AccountAddressesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const addresses = await getUserAddresses()

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
        Your Saved Addresses
      </h2>
      
      <div className="max-w-3xl">
        <AddressSelector initialAddresses={addresses} />
      </div>
    </div>
  )
}
