import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserAddresses } from "@/actions/address"
import AddressSelector from "@/app/checkout/address/address-selector"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Addresses",
};



export default async function AccountAddressesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const addresses = await getUserAddresses()

  return (
    <div className="w-full">
      <AddressSelector initialAddresses={addresses} isCheckout={false} />
    </div>
  )
}
