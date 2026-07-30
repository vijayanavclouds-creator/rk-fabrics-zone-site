"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { updateProfile } from "@/actions/user"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { uploadProfileImage } from "@/actions/upload"
import Image from "next/image"
import { Camera } from "lucide-react"

export default function ProfileForm({ user, isStaff = false }: { user: { name: string, email: string, phone: string, dob?: string, image?: string, receiveOrderEmails?: boolean }, isStaff?: boolean }) {
  const [name, setName] = useState(user.name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [dob, setDob] = useState(user.dob || "")
  const [receiveOrderEmails, setReceiveOrderEmails] = useState(user.receiveOrderEmails ?? true)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, update } = useSession()
  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchParams.get("focus") === "phone") {
      phoneInputRef.current?.focus()
      phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [searchParams])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    
    setUploadingImage(true)
    const formData = new FormData()
    formData.append("file", file)
    
    const result = await uploadProfileImage(formData)
    setUploadingImage(false)

    if (result.success) {
      await update({ image: result.url })
      toast.success("Profile photo updated!")
      router.refresh()
    } else {
      toast.error(result.error || "Failed to upload photo")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (phone && !/^(?!(\d)\1{9})[6-9]\d{9}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number starting with 6-9")
      return
    }
    
    if (dob) {
      const dobDate = new Date(dob)
      const age = new Date().getFullYear() - dobDate.getFullYear()
      if (age < 13 || isNaN(dobDate.getTime())) {
        toast.error("You must be at least 13 years old")
        return
      }
    }

    setLoading(true)
    const result = await updateProfile({ name, phone, dob, receiveOrderEmails })
    setLoading(false)

    if (result.success) {
      await update({ name, phone, dob, receiveOrderEmails })
      toast.success("Profile updated successfully!")
      
      const callbackUrl = searchParams.get("callbackUrl")
      if (callbackUrl) {
        router.push(callbackUrl)
      } else {
        router.refresh()
      }
    } else {
      toast.error(result.error || "Failed to update profile")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden relative border-4 border-white shadow-sm flex items-center justify-center">
            {user.image ? (
              <Image src={user.image} alt={user.name || "Profile"} fill className="object-cover" sizes="96px" />
            ) : (
              <span className="text-3xl text-slate font-bold">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-charcoal text-white rounded-full hover:bg-teal-600 transition-colors cursor-pointer shadow-md">
            <Camera size={16} />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
          </label>
        </div>
        <div>
          <h3 className="font-bold text-charcoal text-lg">Profile Photo</h3>
          <p className="text-xs text-slate">JPG or PNG. Max 5MB.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-charcoal mb-2">Email Address (Read Only)</label>
        <input type="email" value={user.email} readOnly className="w-full px-4 py-3 rounded-xl border border-charcoal/10 bg-slate-50 text-slate focus:outline-none" />
      </div>
      <div>
        <label className="block text-sm font-bold text-charcoal mb-2">Full Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-charcoal transition-all" />
      </div>
      <div>
        <label className="block text-sm font-bold text-charcoal mb-2">Mobile Number</label>
        <input ref={phoneInputRef} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={10} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-charcoal transition-all" />
      </div>
      <div>
        <label className="block text-sm font-bold text-charcoal mb-2">Date of Birth</label>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-charcoal transition-all text-slate-800" />
      </div>

      {!isStaff && (
        <div className="flex items-center gap-3 py-2">
          <input 
            type="checkbox" 
            id="receiveOrderEmails"
            checked={receiveOrderEmails} 
            onChange={(e) => setReceiveOrderEmails(e.target.checked)} 
            className="w-5 h-5 rounded border-charcoal/20 text-teal-600 focus:ring-teal-600"
          />
          <label htmlFor="receiveOrderEmails" className="text-sm font-medium text-charcoal cursor-pointer select-none">
            Receive order status updates via email
          </label>
        </div>
      )}

      <div className="pt-2">
        <button type="submit" disabled={loading} className="btn-primary !py-2 !px-4 text-sm w-fit disabled:opacity-50">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
