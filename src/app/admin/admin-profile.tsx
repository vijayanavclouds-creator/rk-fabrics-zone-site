"use client"

import { useSession } from "next-auth/react"
import ProfileForm from "@/app/account/profile/profile-form"
import PasswordForm from "@/app/account/profile/password-form"
import ActiveSessions from "@/app/account/profile/active-sessions"

export function AdminProfile() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-charcoal tracking-tight">My Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Account Information */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-charcoal mb-6 border-b border-charcoal/10 pb-4">Personal Information</h3>
            <ProfileForm 
              isStaff={true}
              user={{ 
                name: session.user.name || "", 
                email: session.user.email || "", 
                phone: session.user.phone || "", 
                dob: session.user.dob || "", 
                image: session.user.image || "", 
                receiveOrderEmails: session.user.receiveOrderEmails ?? true 
              }} 
            />
          </div>
        </div>

        {/* Right Column: Account Settings */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-charcoal mb-6 border-b border-charcoal/10 pb-4">Security</h3>
            <PasswordForm />
          </div>

          <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm p-6 md:p-8">
            <h3 className="text-xl font-bold text-charcoal mb-6 border-b border-charcoal/10 pb-4">Active Sessions</h3>
            <ActiveSessions />
          </div>
        </div>
      </div>
    </div>
  )
}
