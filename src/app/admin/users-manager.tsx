"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { getUsers } from "@/actions/auth"
import { updateUserRole } from "@/actions/admin"
import { getAllAdminCoupons, getCouponUsageDetails } from "@/actions/coupon"
import { toast } from "sonner"
import { Shield, User, Loader2, ChevronDown, ChevronUp, Headset, Check, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function UsersManager() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  // Coupon Filter State
  const [globalCoupons, setGlobalCoupons] = useState<any[]>([])
  const [couponFilter, setCouponFilter] = useState<string>("")
  const [couponUsage, setCouponUsage] = useState<{ usedUserIds: string[], ineligibleUserIds: string[], isForNewUsersOnly: boolean } | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Accordion state
  const [showAdmins, setShowAdmins] = useState(true)
  const [showSupport, setShowSupport] = useState(true)
  const [showCustomers, setShowCustomers] = useState(false)
  const [customerPage, setCustomerPage] = useState(1)

  const fetchData = async () => {
    try {
      const [usersRes, couponsRes] = await Promise.all([
        getUsers(),
        getAllAdminCoupons()
      ])
      if (usersRes.success) {
        setUsers(usersRes.users || [])
      } else {
        toast.error(usersRes.error)
      }
      if (couponsRes.success) {
        setGlobalCoupons(couponsRes.coupons || [])
      }
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const params = new URLSearchParams(window.location.search)
    if (params.get("couponFilter")) {
      setCouponFilter(params.get("couponFilter")!)
    }
  }, [])

  useEffect(() => {
    if (couponFilter) {
      const fetchUsage = async () => {
        const res = await getCouponUsageDetails(couponFilter)
        if (res.success) {
          setCouponUsage(res as any)
          setShowCustomers(true) // auto-open customers if filtering
        }
      }
      fetchUsage()
    } else {
      setCouponUsage(null)
      setSelectedUsers([])
    }
  }, [couponFilter])

  const handleRoleChange = (userId: string, newRole: "CUSTOMER" | "ADMIN" | "SUPPORT") => {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res.success) {
        toast.success(`User role updated to ${newRole}!`)
        fetchData()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleRedirectToNewsletter = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user")
      return
    }
    
    let targetType = "Selected Users"
    if (couponFilter) {
      const coupon = globalCoupons.find(c => c.code === couponFilter)
      if (coupon) {
        if (coupon.isForNewUsersOnly) targetType = "New Users"
        else if (coupon.validForUserId) targetType = "Specific User"
        else targetType = "All Users"
      }
      localStorage.setItem("targetCouponCode", couponFilter)
      localStorage.setItem("targetUserType", targetType)
    } else {
      localStorage.removeItem("targetCouponCode")
      localStorage.setItem("targetUserType", targetType)
    }

    localStorage.setItem("targetUsers", JSON.stringify(selectedUsers))
    router.push("/admin?tab=newsletters")
  }

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-charcoal" /></div>
  }

  const adminUsers = users.filter(u => u.role === "ADMIN")
  const supportUsers = users.filter(u => u.role === "SUPPORT")
  let customerUsers = users.filter(u => u.role === "CUSTOMER")

  // Filter out ineligible users if a coupon filter is active
  if (couponFilter && couponUsage) {
    customerUsers = customerUsers.filter(u => !couponUsage.ineligibleUserIds.includes(u.id))
  }

  const customersPerPage = 10;
  const totalCustomerPages = Math.ceil(customerUsers.length / customersPerPage);
  const paginatedCustomers = customerUsers.slice((customerPage - 1) * customersPerPage, customerPage * customersPerPage);

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId])
  }

  const selectAllUsed = () => {
    if (!couponUsage) return
    const usedIds = customerUsers.filter(u => couponUsage.usedUserIds.includes(u.id)).map(u => u.id)
    setSelectedUsers(usedIds)
  }

  const selectAllUnused = () => {
    if (!couponUsage) return
    const unusedIds = customerUsers.filter(u => !couponUsage.usedUserIds.includes(u.id)).map(u => u.id)
    setSelectedUsers(unusedIds)
  }

  const UserRow = ({ user, icon: Icon, iconColor, iconBg, showCouponStatus }: any) => {
    const isUsed = couponUsage ? couponUsage.usedUserIds.includes(user.id) : false
    const isSelected = selectedUsers.includes(user.id)

    return (
      <div className={cn(
        "flex items-center justify-between py-2 md:py-2.5 px-3 md:px-4 border-b border-charcoal/5 last:border-b-0 hover:bg-slate-50 transition-colors gap-3",
        isSelected && "bg-teal-50/30 hover:bg-teal-50/50"
      )}>
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          {showCouponStatus && (
            <button 
              onClick={() => toggleSelectUser(user.id)}
              className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors", isSelected ? "bg-teal-600 border-teal-600" : "border-slate-300 bg-white")}
            >
              {isSelected && <Check size={12} className="text-white" />}
            </button>
          )}
          <div className={`p-1.5 md:p-2 rounded-lg ${iconBg} ${iconColor} shrink-0`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-charcoal text-sm truncate">{user.name}</h3>
            <p className="text-[10px] md:text-xs text-slate truncate">{user.email}</p>
          </div>
        </div>
        
        {showCouponStatus && (
          <div className="flex shrink-0 px-2 md:px-4 items-center justify-center w-20 md:w-24">
            {isUsed ? (
              <div className="flex items-center justify-center text-emerald-600 bg-emerald-50 w-7 h-7 rounded-full border border-emerald-100 shadow-sm" title="Used">
                <Check size={16} strokeWidth={3} />
              </div>
            ) : (
              <div className="flex items-center justify-center text-rose-500 bg-rose-50 w-7 h-7 rounded-full border border-rose-100 shadow-sm" title="Not Used">
                <X size={16} strokeWidth={3} />
              </div>
            )}
          </div>
        )}

        <div className="flex shrink-0">
          <RoleSelect
            value={user.role}
            onChange={(newRole) => handleRoleChange(user.id, newRole as any)}
            disabled={isPending || user.role === "ADMIN" || showCouponStatus}
            options={[
              { value: "ADMIN", label: "ADMIN" },
              { value: "SUPPORT", label: "SUPPORT" },
              { value: "CUSTOMER", label: "CUSTOMER" }
            ]}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4 mb-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">User Management</h2>
        <div className="flex flex-wrap gap-2 items-center">
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
              className={cn("w-full flex items-center justify-between py-2 md:py-2.5 px-3 md:px-4 bg-slate-50 hover:bg-slate-100 transition-colors", showAdmins ? "rounded-t-2xl" : "rounded-2xl")}
            >
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-teal-600" />
                <h3 className="font-bold text-charcoal text-sm">Administrators ({adminUsers.length})</h3>
              </div>
              {showAdmins ? <ChevronUp size={16} className="text-slate" /> : <ChevronDown size={16} className="text-slate" />}
            </button>
            
            {showAdmins && (
              <div className="flex flex-col bg-white rounded-b-2xl overflow-hidden">
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
              className={cn("w-full flex items-center justify-between py-2 md:py-2.5 px-3 md:px-4 bg-slate-50 hover:bg-slate-100 transition-colors", showSupport ? "rounded-t-2xl" : "rounded-2xl")}
            >
              <div className="flex items-center gap-3">
                <Headset size={16} className="text-blue-600" />
                <h3 className="font-bold text-charcoal text-sm">Support Staff ({supportUsers.length})</h3>
              </div>
              {showSupport ? <ChevronUp size={16} className="text-slate" /> : <ChevronDown size={16} className="text-slate" />}
            </button>
            
            {showSupport && (
              <div className="flex flex-col bg-white rounded-b-2xl overflow-hidden">
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

          {/* Customer Coupon Filters */}
          <div className="bg-cream/50 p-4 rounded-2xl border border-charcoal/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center w-full md:w-auto">
              <label className="text-xs font-bold text-slate uppercase tracking-wider">Filter by Coupon Usage:</label>
              <CouponSelect 
                value={couponFilter} 
                onChange={(v) => { setCouponFilter(v); setCustomerPage(1); }} 
                options={[
                  { value: "", label: "All Customers" },
                  ...globalCoupons.map(c => {
                    let typeTag = "All Users"
                    if (c.isForNewUsersOnly) typeTag = "New Users"
                    else if (c.validForUserId) typeTag = "Specific User"
                    
                    return {
                      value: c.code,
                      label: `${c.code} (${c.discountValue}${c.discountType === 'PERCENTAGE' ? '%' : '₹'} OFF) - ${typeTag}`
                    }
                  })
                ]} 
              />
            </div>

            {couponFilter && (
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button onClick={selectAllUnused} className="btn-secondary !py-1.5 !text-xs !px-3">
                  Select Unused
                </button>
                <button onClick={selectAllUsed} className="btn-secondary !py-1.5 !text-xs !px-3">
                  Select Used
                </button>
                {selectedUsers.length > 0 && (
                  <button onClick={handleRedirectToNewsletter} className="btn-primary flex items-center gap-2 !py-1.5 !text-xs !px-3 !rounded-full">
                    <Send size={14} /> Send Newsletter ({selectedUsers.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Customers Accordion */}
          <div className="border border-charcoal/10 rounded-2xl">
            <button 
              onClick={() => setShowCustomers(!showCustomers)}
              className={cn("w-full flex items-center justify-between py-2 md:py-2.5 px-3 md:px-4 bg-slate-50 hover:bg-slate-100 transition-colors", showCustomers ? "rounded-t-2xl" : "rounded-2xl")}
            >
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-500" />
                <h3 className="font-bold text-charcoal text-sm">Customers ({customerUsers.length})</h3>
              </div>
              {showCustomers ? <ChevronUp size={16} className="text-slate" /> : <ChevronDown size={16} className="text-slate" />}
            </button>
            
            {showCustomers && (
              <div className="flex flex-col bg-white rounded-b-2xl overflow-hidden">
                {customerUsers.length === 0 ? (
                  <p className="text-sm text-slate text-center py-4">No eligible customers found.</p>
                ) : (
                  <>
                    {paginatedCustomers.map((user) => (
                      <UserRow key={user.id} user={user} icon={User} iconColor="text-slate-500" iconBg="bg-slate-200" showCouponStatus={!!couponFilter} />
                    ))}
                    {totalCustomerPages > 1 && (
                      <div className="p-3 md:p-4 flex items-center justify-center gap-2 bg-slate-50/50 border-t border-charcoal/5">
                        <button 
                          onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                          disabled={customerPage === 1}
                          className="px-3 py-1.5 border border-charcoal/10 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          Previous
                        </button>
                        <div className="flex items-center px-3 font-medium text-xs text-charcoal">
                          Page {customerPage} of {totalCustomerPages}
                        </div>
                        <button 
                          onClick={() => setCustomerPage(p => Math.min(totalCustomerPages, p + 1))}
                          disabled={customerPage === totalCustomerPages}
                          className="px-3 py-1.5 border border-charcoal/10 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
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

const CouponSelect = ({ value, onChange, options, disabled }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], disabled?: boolean }) => {
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

  const selectedLabel = options.find(o => o.value === value)?.label || "All Customers"

  return (
    <div className="relative w-full md:w-[360px]" ref={dropdownRef}>
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
          <div className="grid grid-cols-2 gap-1">
            {options.map(opt => (
              <button 
                key={opt.value} 
                type="button" 
                title={opt.label}
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
        </div>
      )}
    </div>
  )
}
