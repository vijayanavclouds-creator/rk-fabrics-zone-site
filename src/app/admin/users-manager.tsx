"use client"

import { useState, useEffect, useTransition } from "react"
import { getUsers } from "@/actions/auth"
import { updateUserRole } from "@/actions/admin"
import { toast } from "sonner"
import { Shield, User, Loader2, ChevronDown, ChevronUp, Headset, Check } from "lucide-react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

export function UsersManager() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  // Accordion state
  const [showAdmins, setShowAdmins] = useState(true)
  const [showSupport, setShowSupport] = useState(true)
  const [showCustomers, setShowCustomers] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      if (res.success) {
        setUsers(res.users || [])
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = (userId: string, newRole: "CUSTOMER" | "ADMIN" | "SUPPORT") => {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res.success) {
        toast.success(`User role updated to ${newRole}!`)
        fetchUsers()
      } else {
        toast.error(res.error)
      }
    })
  }

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-charcoal" /></div>
  }

  const adminUsers = users.filter(u => u.role === "ADMIN")
  const supportUsers = users.filter(u => u.role === "SUPPORT")
  const customerUsers = users.filter(u => u.role === "CUSTOMER")

  const UserRow = ({ user, icon: Icon, iconColor, iconBg }: any) => (
    <div className="flex items-center justify-between p-3 md:p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors gap-3">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className={`p-2 md:p-3 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-charcoal truncate">{user.name}</h3>
          <p className="text-xs md:text-sm text-slate truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex shrink-0">
        <RoleSelect
          value={user.role}
          onChange={(newRole) => handleRoleChange(user.id, newRole as any)}
          disabled={isPending || user.role === "ADMIN"}
          options={[
            { value: "ADMIN", label: "ADMIN" },
            { value: "SUPPORT", label: "SUPPORT" },
            { value: "CUSTOMER", label: "CUSTOMER" }
          ]}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4 mb-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">User Management</h2>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate">
            Admin Accounts: <span className={adminUsers.length >= 5 ? "text-rose-600" : "text-teal-600"}>{adminUsers.length}/5</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-none md:rounded-3xl border-y md:border border-charcoal/10 border-x-0 md:border-x p-4 md:p-8 shadow-sm -mx-4 md:mx-0">
        <div className="space-y-4">
          
          {/* Admins Accordion */}
          <div className="border border-charcoal/10 rounded-2xl">
            <button 
              onClick={() => setShowAdmins(!showAdmins)}
              className={cn("w-full flex items-center justify-between p-3 md:p-4 bg-slate-50 hover:bg-slate-100 transition-colors", showAdmins ? "rounded-t-2xl" : "rounded-2xl")}
            >
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-teal-600" />
                <h3 className="font-bold text-charcoal">Administrators ({adminUsers.length})</h3>
              </div>
              {showAdmins ? <ChevronUp size={20} className="text-slate" /> : <ChevronDown size={20} className="text-slate" />}
            </button>
            
            {showAdmins && (
              <div className="p-3 md:p-4 space-y-3 bg-white rounded-b-2xl">
                {adminUsers.length === 0 ? (
                  <p className="text-sm text-slate text-center py-4">No admin users found.</p>
                ) : (
                  adminUsers.map((user) => (
                    <UserRow key={user.id} user={user} icon={Shield} iconColor="text-teal-600" iconBg="bg-teal-100" />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Support Accordion */}
          <div className="border border-charcoal/10 rounded-2xl">
            <button 
              onClick={() => setShowSupport(!showSupport)}
              className={cn("w-full flex items-center justify-between p-3 md:p-4 bg-slate-50 hover:bg-slate-100 transition-colors", showSupport ? "rounded-t-2xl" : "rounded-2xl")}
            >
              <div className="flex items-center gap-3">
                <Headset size={20} className="text-blue-600" />
                <h3 className="font-bold text-charcoal">Support Staff ({supportUsers.length})</h3>
              </div>
              {showSupport ? <ChevronUp size={20} className="text-slate" /> : <ChevronDown size={20} className="text-slate" />}
            </button>
            
            {showSupport && (
              <div className="p-3 md:p-4 space-y-3 bg-white rounded-b-2xl">
                {supportUsers.length === 0 ? (
                  <p className="text-sm text-slate text-center py-4">No support users found.</p>
                ) : (
                  supportUsers.map((user) => (
                    <UserRow key={user.id} user={user} icon={Headset} iconColor="text-blue-600" iconBg="bg-blue-100" />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Customers Accordion */}
          <div className="border border-charcoal/10 rounded-2xl">
            <button 
              onClick={() => setShowCustomers(!showCustomers)}
              className={cn("w-full flex items-center justify-between p-3 md:p-4 bg-slate-50 hover:bg-slate-100 transition-colors", showCustomers ? "rounded-t-2xl" : "rounded-2xl")}
            >
              <div className="flex items-center gap-3">
                <User size={20} className="text-slate-500" />
                <h3 className="font-bold text-charcoal">Customers ({customerUsers.length})</h3>
              </div>
              {showCustomers ? <ChevronUp size={20} className="text-slate" /> : <ChevronDown size={20} className="text-slate" />}
            </button>
            
            {showCustomers && (
              <div className="p-3 md:p-4 space-y-3 bg-white rounded-b-2xl">
                {customerUsers.length === 0 ? (
                  <p className="text-sm text-slate text-center py-4">No customers found.</p>
                ) : (
                  customerUsers.map((user) => (
                    <UserRow key={user.id} user={user} icon={User} iconColor="text-slate-500" iconBg="bg-slate-200" />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const RoleSelect = ({ value, onChange, options, disabled }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find(o => o.value === value)?.label || "Select role"

  return (
    <div className="relative w-[110px] md:w-[150px]" ref={dropdownRef}>
      <button 
        type="button" 
        onClick={() => !disabled && setIsOpen(!isOpen)} 
        disabled={disabled}
        className={cn(
          "btn-primary w-full !py-1.5 md:!py-2 !px-3 md:!px-4 flex justify-between items-center text-[10px] md:text-sm",
          disabled && "opacity-50 cursor-not-allowed hover:bg-white"
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={14} className={cn("transition-transform ml-1 shrink-0", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-[#FAF9F6] border border-white/60 rounded-xl shadow-[4px_4px_10px_rgba(179,207,229,0.65),-4px_-4px_10px_rgba(255,255,255,0.9)] z-50 p-1 md:p-1.5 max-h-64 overflow-y-auto no-scrollbar">
          {options.map(opt => (
            <button 
              key={opt.value} 
              type="button" 
              onClick={() => { onChange(opt.value); setIsOpen(false) }} 
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 hover:bg-white/50 rounded-lg cursor-pointer group transition-colors"
            >
              <div className={cn("w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0", value === opt.value ? "border-teal-600" : "border-charcoal/20 group-hover:border-teal-600")}>
                {value === opt.value && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-teal-600" /> }
              </div>
              <span className={cn("text-[10px] md:text-[13px] transition-colors text-charcoal truncate", value === opt.value ? "font-bold" : "font-medium")}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
