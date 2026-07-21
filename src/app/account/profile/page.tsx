import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"
import PasswordForm from "./password-form"
import DeactivateAccount from "./deactivate-account"

export default async function AccountProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
          Account Information
        </h2>
        <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
          <ProfileForm user={{ name: session.user.name || "", email: session.user.email || "", phone: session.user.phone || "", dob: session.user.dob || "", image: session.user.image || "" }} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
          Security
        </h2>
        <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
          <PasswordForm />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-error mb-6">
          Danger Zone
        </h2>
        <div className="bg-rose-50 rounded-3xl border border-error/20 p-6 md:p-8">
          <DeactivateAccount />
        </div>
      </div>
    </div>
  )
}
