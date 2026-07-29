import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"
import PasswordForm from "./password-form"
import DeactivateAccount from "./deactivate-account"
import ActiveSessions from "./active-sessions"
import TwoFactorAuth from "./two-factor-auth"
import MobileNumberBanner from "../mobile-number-banner"

export default async function AccountProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      {!session.user.phone && <MobileNumberBanner />}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Column: Account Information */}
        <div className="lg:col-span-6 flex flex-col">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
          Account Information
        </h2>
        <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm flex-1">
          <ProfileForm user={{ name: session.user.name || "", email: session.user.email || "", phone: session.user.phone || "", dob: session.user.dob || "", image: session.user.image || "", receiveOrderEmails: session.user.receiveOrderEmails ?? true }} />
        </div>
      </div>

      {/* Right Column: Account Settings */}
      <div className="lg:col-span-6 flex flex-col lg:border-l lg:border-charcoal/10 lg:pl-12">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">
          Account Settings
        </h2>
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm flex-1 flex flex-col overflow-hidden">
          
          <div className="p-6 md:p-8 border-b border-charcoal/10">
            <h3 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-4">Security</h3>
            <PasswordForm />
          </div>

          <div className="p-6 md:p-8 border-b border-charcoal/10">
            <h3 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-4">Two-Factor Authentication</h3>
            <TwoFactorAuth />
          </div>

          <div className="p-6 md:p-8 border-b border-charcoal/10 flex-1">
            <h3 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-4">Active Sessions</h3>
            <ActiveSessions />
          </div>

          <div className="p-6 md:p-8 bg-rose-50/50">
            <h3 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-error mb-4">Danger Zone</h3>
            <DeactivateAccount />
          </div>
          
        </div>
      </div>
    </div>
    </div>
  )
}
