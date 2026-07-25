"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { updateProduct, createProduct, deleteProduct, bulkUpdateImagesAndVariants, toggleProductStatus } from "@/actions/admin"
import { toast } from "sonner"
import { Save, Upload, X, Star, Trash2, Plus, Edit, Image as ImageIcon, ChevronDown, LayoutTemplate, Activity, User, Menu, Tag, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import imageCompression from 'browser-image-compression'
import { PRODUCT_CATEGORIES } from "@/lib/constants"

import { BannerManager } from "./banner-manager"
import { SystemStatus } from "./system-status"
import { UsersManager } from "./users-manager"
import { OrdersManager } from "./orders-manager"
import { NavigationManager } from "./navigation-manager"
import { TaxonomyManager } from "./taxonomy-manager"
import { DashboardOverview } from "./dashboard-overview"
import { CompanyProfileManager } from "./company-profile-manager"
import { FinanceManager } from "./finance-manager"
import { QueriesManager } from "./queries-manager"
import { NewsletterManager } from "./newsletter-manager"
import { ActivitiesManager } from "./activities-manager"
import { PortalHeader } from "@/components/layout/portal-header"

export function AdminDashboard({ 
  products, 
  initialBanners = [],
  storeCategories = [],
  storeFabrics = [],
  queries = [],
  analyticsData = null
}: { 
  products: any[], 
  initialBanners?: any[],
  storeCategories?: { value: string, label: string }[],
  storeFabrics?: { value: string, label: string }[],
  queries?: any[],
  analyticsData?: any
}) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as any
  const targetView = ["overview", "list", "new", "edit", "banners", "system", "users", "orders", "navigation", "taxonomy", "company_profile", "finance", "queries", "newsletters", "activities"].includes(tabParam) ? tabParam : "overview"
  
  const [activeView, setActiveView] = useState<any>(targetView)
  const [prevTabParam, setPrevTabParam] = useState(tabParam)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isPending, startTransition] = useTransition()
  
  // State for new product
  const [newCategory, setNewCategory] = useState<string[]>([])
  const [newFabric, setNewFabric] = useState<string>("")

  // Sync state synchronously during render when URL changes to prevent flashing old tab
  if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam)
    setActiveView(targetView)
  }

  useEffect(() => {
    if (editingProduct) {
      const updatedProduct = products.find(p => p.id === editingProduct.id)
      if (updatedProduct) {
        setEditingProduct(updatedProduct)
      }
    }
  }, [products])

  const handleCreateProduct = (formData: FormData) => {
    startTransition(async () => {
      const res = await createProduct(formData)
      if (res.success) {
        toast.success("Product created successfully!")
        setActiveView("list")
      } else {
        toast.error(res.error || "Failed to create product")
      }
    })
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return
    startTransition(async () => {
      const res = await deleteProduct(id)
      if (res.success) {
        toast.success(`Product deleted`)
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleProductStatus(id, !currentStatus)
      if (res.success) {
        toast.success(`Product status updated`)
      } else {
        toast.error(res.error || "Failed to update status")
      }
    })
  }

  if ((activeView === "edit" && editingProduct) || activeView === "new") {
    return (
      <ProductEditor 
        product={editingProduct || {}} 
        products={products}
        storeCategories={storeCategories}
        storeFabrics={storeFabrics}
        onClose={() => { setActiveView("list"); setEditingProduct(null); }} 
      />
    )
  }

  // LIST VIEW
  return (
    <div className={cn("animate-in fade-in duration-300 min-h-screen", activeView !== "overview" ? "p-6 md:p-8 bg-transparent space-y-6" : "")}>
      {activeView === "overview" && <DashboardOverview initialData={analyticsData} />}
      
      {activeView === "company_profile" && <CompanyProfileManager />}
      {activeView === "finance" && <FinanceManager />}
      {activeView === "queries" && <QueriesManager initialQueries={queries || []} />}
      {activeView === "newsletters" && <NewsletterManager />}

      {activeView === "list" && (
        <PortalHeader 
          title="Admin Dashboard"
          description="Manage your products and inventory in real-time."
          rightElement={
            <button 
              onClick={() => setActiveView("new")}
              className="flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-black transition-all shadow-neo-btn hover:-translate-y-1 w-full sm:w-auto justify-center whitespace-nowrap text-sm"
            >
              <Plus size={18} /> Add Product
            </button>
          }
        />
      )}

      {activeView === "banners" && (
        <BannerManager banners={initialBanners} />
      )}

      {activeView === "navigation" && (
        <NavigationManager />
      )}

      {activeView === "taxonomy" && (
        <TaxonomyManager initialCategories={storeCategories} initialFabrics={storeFabrics} />
      )}

      {activeView === "system" && (
        <SystemStatus />
      )}

      {activeView === "users" && <UsersManager />}
      {activeView === "orders" && <OrdersManager />}
      {activeView === "activities" && <ActivitiesManager />}

      {activeView === "list" && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4 mb-6">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
                Product Management
              </h2>
              <p className="text-slate mt-1 text-sm">Manage your products and inventory in real-time.</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-charcoal/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br from-white to-cream/20">
          <div className="w-full">
            <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-cream-dark/30 border-b border-charcoal/10">
              <th className="py-2 px-4 font-bold text-charcoal w-[30%]">Product Name</th>
              <th className="py-2 px-4 font-bold text-charcoal w-[10%] whitespace-nowrap overflow-hidden text-ellipsis text-left">Category</th>
              <th className="py-2 px-4 font-bold text-charcoal w-[10%] whitespace-nowrap overflow-hidden text-ellipsis text-left">MRP (₹)</th>
              <th className="py-2 px-4 font-bold text-charcoal w-[10%] whitespace-nowrap overflow-hidden text-ellipsis text-left">Disc.</th>
              <th className="py-2 px-4 font-bold text-charcoal w-[10%] text-left">Images</th>
              <th className="py-2 px-4 font-bold text-charcoal w-[10%] text-left">Variants</th>
              <th className="py-2 px-4 font-bold text-charcoal w-[10%] whitespace-nowrap overflow-hidden text-ellipsis text-left">Status</th>
              <th className="py-2 px-4 font-bold text-charcoal w-[10%] text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isNew = new Date(product.createdAt).getTime() >= Date.now() - 16 * 24 * 60 * 60 * 1000;
              const isOutOfStock = product.variants?.length > 0 && product.variants.every((v:any) => v.stock <= 0);

              return (
              <tr key={product.id} className="border-b border-charcoal/5 hover:bg-cream/40 transition-colors group relative">

                <td className="py-2 px-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream border border-charcoal/10 shrink-0 relative">
                      {product.images && product.images.length > 0 ? (
                        <Image src={product.images.find((i:any)=>i.isPrimary)?.url || product.images[0].url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate/30"><ImageIcon size={18} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-charcoal block group-hover:text-teal-700 transition-colors truncate" title={product.name}>{product.name}</span>
                      {product.isFreeDelivery && <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">Free Delivery</span>}
                    </div>
                  </div>
                </td>
                <td className="py-2 px-4 text-charcoal font-medium capitalize whitespace-nowrap">
                  {(() => {
                    try {
                      const cats = JSON.parse(product.category);
                      if (Array.isArray(cats)) return cats.map(c => c.replace("-", " ")).join(", ");
                    } catch(e) {}
                    return String(product.category).replace("-", " ");
                  })()}
                </td>
                <td className="py-2 px-4 text-charcoal font-bold whitespace-nowrap">₹{product.basePrice}</td>
                <td className="py-2 px-4 whitespace-nowrap">
                  {product.discountPercent > 0 ? (
                    <span className="text-rose font-bold bg-rose-50 px-2 py-1 rounded text-xs border border-rose-100 whitespace-nowrap">{product.discountPercent}% OFF</span>
                  ) : <span className="text-slate-400">-</span>}
                </td>
                <td className="py-2 px-4 text-slate font-medium">
                  <div className="flex items-center gap-1">
                    <ImageIcon size={14} className="text-teal-600" /> {product.images?.length || 0}
                  </div>
                </td>
                <td className="py-2 px-4 text-slate font-medium">{product.variants?.length || 0}</td>
                <td className="py-2 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={product.isActive !== false}
                    onChange={() => handleToggleStatus(product.id, product.isActive !== false)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600 cursor-pointer disabled:opacity-50"
                    disabled={isPending}
                    title={product.isActive !== false ? "Active" : "Inactive"}
                  />
                </td>
                <td className="py-2 px-4 relative">
                  {/* TAGS */}
                  {isOutOfStock && (
                    <div className="absolute bottom-4 -right-1 flex flex-col gap-1 z-20 rotate-[30deg] origin-bottom-right opacity-90 pointer-events-none shadow-xl">
                      <span className="bg-rose-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm border border-rose-700 whitespace-nowrap">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {isNew && !isOutOfStock && (
                    <div className="absolute top-4 -right-1 flex flex-col gap-1 z-20 rotate-[30deg] origin-bottom-right opacity-90 pointer-events-none shadow-xl">
                      <span className="bg-amber-400 text-charcoal text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm border border-amber-500 whitespace-nowrap">
                        New
                      </span>
                    </div>
                  )}
                  <div className="flex justify-start gap-2">
                    <button 
                      onClick={() => { setEditingProduct(product); setActiveView("edit") }}
                      className="btn-primary w-9 h-9 flex items-center justify-center p-0 !px-0 rounded-lg flex-shrink-0"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 text-charcoal bg-cream hover:bg-rose hover:text-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
            </tbody>
            </table>
          </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProductEditor({ product = {}, products, storeCategories, storeFabrics, onClose }: { product?: any, products: any[], storeCategories: any[], storeFabrics: any[], onClose: () => void }) {
  const [activeProductId, setActiveProductId] = useState<string | null>(product.id || null)
  const [isPending, startTransition] = useTransition()
  const [isSavingBulk, setIsSavingBulk] = useState(false)

  // Top level fields state
  const [updatedCategory, setUpdatedCategory] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(product.category);
      return Array.isArray(parsed) ? parsed : (product.category ? [product.category] : []);
    } catch {
      return product.category ? [product.category] : [];
    }
  })
  const [updatedFabric, setUpdatedFabric] = useState<string>(product.fabric || "")
  const [updatedFabricDetails, setUpdatedFabricDetails] = useState<string>(product.fabricDetails || "")
  const [baseDetailsChanged, setBaseDetailsChanged] = useState(false)

  const [variants, setVariants] = useState<any[]>(product.variants || [])
  const [newVariants, setNewVariants] = useState<any[]>(() => {
    if (!product.id) {
      const now = Date.now();
      return [
        { tempId: `temp-${now}-1`, size: "S", color: "Default", colorHex: "#000000", price: 0, stock: 10 },
        { tempId: `temp-${now}-2`, size: "M", color: "Default", colorHex: "#000000", price: 0, stock: 10 },
        { tempId: `temp-${now}-3`, size: "L", color: "Default", colorHex: "#000000", price: 0, stock: 10 },
        { tempId: `temp-${now}-4`, size: "XL", color: "Default", colorHex: "#000000", price: 0, stock: 10 },
      ]
    }
    return []
  })
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([])

  const [images, setImages] = useState<any[]>(product.images || [])
  const [newImageFiles, setNewImageFiles] = useState<{file: File, preview: string}[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(product.images?.find((i:any)=>i.isPrimary)?.id || null)
  const [newPrimaryIndex, setNewPrimaryIndex] = useState<number | null>(null)

  const baseDetailsFormRef = useRef<HTMLFormElement>(null)

  const handleUpdateBaseDetails = async (formData: FormData) => {
    formData.append("category", JSON.stringify(updatedCategory))
    formData.append("fabric", updatedFabric)
    formData.append("fabricDetails", updatedFabricDetails)
    
    if (!activeProductId) {
      const res = await createProduct(formData)
      if (res.success && res.product) {
        setActiveProductId(res.product.id)
        setBaseDetailsChanged(false)
        return res.product.id
      } else {
        toast.error(res.error || "Failed to create product")
        return null
      }
    } else {
      formData.append("id", activeProductId)
      const res = await updateProduct(formData)
      if (res.success) {
        setBaseDetailsChanged(false)
        return activeProductId
      } else {
        toast.error(res.error || "Failed to update base details")
        return null
      }
    }
  }


  const updatedVariants = variants.filter(v => {
    if (!product.variants) return false
    const original = product.variants.find((ov:any) => ov.id === v.id)
    if (!original) return false
    return original.size !== v.size || original.color !== v.color || original.colorHex !== v.colorHex || original.price !== v.price || original.stock !== v.stock
  })

  const handleBulkSave = async (targetProductId: string) => {
    setIsSavingBulk(true)
    try {
      let uploadedImagesUrls = []
      if (newImageFiles.length > 0) {
        toast.loading("Uploading high-res images to Cloudinary...", { id: "uploadToast" })
        const { getCloudinarySignature } = await import("@/actions/cloudinary")
        const { timestamp, signature, cloudName, apiKey } = await getCloudinarySignature()
        
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i].file
          const uploadData = new FormData()
          uploadData.append("file", file)
          uploadData.append("api_key", apiKey!)
          uploadData.append("timestamp", String(timestamp))
          uploadData.append("signature", signature)
          uploadData.append("folder", "rk-fabrics/products")
          uploadData.append("transformation", "w_1500,c_limit,q_auto:good,f_auto")
          
          const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: uploadData
          })
          
          if (!uploadRes.ok) {
            const err = await uploadRes.text()
            throw new Error("Cloudinary upload failed: " + err)
          }
          
          const data = await uploadRes.json()
          uploadedImagesUrls.push({
            url: data.secure_url,
            name: file.name
          })
        }
        toast.dismiss("uploadToast")
      }

      if (deletedImageIds.length > 0) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicIds: deletedImageIds })
        })
      }

      const payload = {
        productId: targetProductId,
        newVariants,
        updatedVariants,
        deletedVariantIds,
        deletedImageIds,
        primaryImageId,
        newPrimaryIndex,
        uploadedImagesUrls
      }

      const formData = new FormData()
      formData.append("payload", JSON.stringify(payload))
      formData.append("category", JSON.stringify(updatedCategory))
      formData.append("fabric", updatedFabric)
      formData.append("fabricDetails", updatedFabricDetails)
      
      const res = await bulkUpdateImagesAndVariants(formData)
      if (res.success) {
        toast.success("Images and Variants saved successfully!")
        if (res.product) {
          setVariants(res.product.variants || [])
          setImages(res.product.images || [])
          const primaryImg = res.product.images?.find((i:any) => i.isPrimary)
          if (primaryImg) setPrimaryImageId(primaryImg.id)
        }
        setNewVariants([])
        setNewImageFiles([])
        setDeletedVariantIds([])
        setDeletedImageIds([])
        setNewPrimaryIndex(null)
        return true
      } else {
        toast.error(res.error || "Failed to save")
        return false
      }
    } catch (err) {
      console.error(err)
      toast.error("An upload error occurred. Please try again.")
      return false
    } finally {
      setIsSavingBulk(false)
    }
  }

  const handleGlobalSave = async () => {
    let baseSuccess = true;
    let variantsImagesSuccess = true;
    let savedSomething = false;
    let currentId = activeProductId;

    if ((baseDetailsChanged || !currentId) && baseDetailsFormRef.current) {
      const formData = new FormData(baseDetailsFormRef.current);
      const newId = await handleUpdateBaseDetails(formData);
      if (newId) {
        currentId = newId;
        savedSomething = true;
      } else {
        baseSuccess = false;
      }
    }

    if (hasChanges && currentId && baseSuccess) {
      variantsImagesSuccess = await handleBulkSave(currentId);
      if (variantsImagesSuccess) savedSomething = true;
    }

    if (savedSomething && baseSuccess && variantsImagesSuccess) {
      toast.success(activeProductId ? "All changes saved successfully!" : "Product created successfully!");
      if (!activeProductId) {
        onClose();
      }
    }
  }

  const changes = [];
  if (baseDetailsChanged || !activeProductId) changes.push(`base details`);
  if (newImageFiles.length > 0) changes.push(`${newImageFiles.length} new images`);
  if (deletedImageIds.length > 0) changes.push(`${deletedImageIds.length} deleted images`);
  if (newVariants.length > 0) changes.push(`${newVariants.length} new variants`);
  if (deletedVariantIds.length > 0) changes.push(`${deletedVariantIds.length} deleted variants`);
  if (updatedVariants.length > 0) changes.push(`${updatedVariants.length} updated variants`);
  const initialPrimaryImageId = product.images?.find((i:any)=>i.isPrimary)?.id || null;
  if (primaryImageId !== initialPrimaryImageId || newPrimaryIndex !== null) changes.push(`primary image`);
  
  const hasChanges = changes.length > 0;
  const changesText = hasChanges ? `Unsaved changes: ${changes.join(', ')}` : "No unsaved changes";

  const handleClose = () => {
    if (hasChanges || baseDetailsChanged) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        return;
      }
    }
    onClose();
  }

  // Handle beforeunload to warn user if they try to close tab or navigate away via browser
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges || baseDetailsChanged) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, baseDetailsChanged]);

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-3 mb-4">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
            {activeProductId ? "Edit Product" : "Create New Product"}
          </h2>
          <p className="text-slate mt-1 text-sm">{activeProductId ? "Update product details, images, and variants." : "Add a new product to your catalog."}</p>
        </div>
        <button 
          onClick={handleClose}
          className="flex items-center justify-center p-2 text-white bg-teal-600 hover:bg-teal-700 rounded-full transition-colors border border-teal-600 shadow-sm mb-[13px]"
          title="Close"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-charcoal/10 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br from-white to-cream/20 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal mb-2 border-b border-charcoal/10 pb-1">Base Details</h3>
          <form ref={baseDetailsFormRef} onChange={() => setBaseDetailsChanged(true)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Product Name</label>
            <input required name="name" type="text" defaultValue={product.name} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Category</label>
            <CategorySelect 
              selected={updatedCategory} 
              onChange={(v:any) => { setUpdatedCategory(v); setBaseDetailsChanged(true); }} 
              options={storeCategories} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Base Price (MRP ₹)</label>
            <input required name="basePrice" type="number" min="0" defaultValue={product.basePrice} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Discount (%)</label>
            <input name="discountPercent" type="number" min="0" max="100" defaultValue={product.discountPercent || 0} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isFreeDelivery" value="true" defaultChecked={product.id ? product.isFreeDelivery : true} id="isFreeDeliveryEdit" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
              <label htmlFor="isFreeDeliveryEdit" className="text-sm font-bold text-charcoal cursor-pointer">Free Delivery</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isNewArrival" value="true" defaultChecked={product.isNewArrival} id="isNewArrivalEdit" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
              <label htmlFor="isNewArrivalEdit" className="text-sm font-bold text-charcoal cursor-pointer">New Arrival</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isBestseller" value="true" defaultChecked={product.isBestseller} id="isBestsellerEdit" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
              <label htmlFor="isBestsellerEdit" className="text-sm font-bold text-charcoal cursor-pointer">Bestseller</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isFeatured" value="true" defaultChecked={product.isFeatured} id="isFeaturedEdit" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
              <label htmlFor="isFeaturedEdit" className="text-sm font-bold text-charcoal cursor-pointer">Featured</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isOnSale" value="true" defaultChecked={product.isOnSale} id="isOnSaleEdit" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
              <label htmlFor="isOnSaleEdit" className="text-sm font-bold text-charcoal cursor-pointer">On Sale</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isReturnable" value="true" defaultChecked={product.id ? product.isReturnable : true} id="isReturnableEdit" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
              <label htmlFor="isReturnableEdit" className="text-sm font-bold text-charcoal cursor-pointer">Return Available</label>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-charcoal/10">
            <h3 className="text-lg font-semibold text-charcoal mb-2">Fabric Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-2 relative">
                <div className="absolute -left-12 top-2 text-teal-600/20">
                  <Scissors size={40} />
                </div>
                <FabricSelect 
                  value={updatedFabric} 
                  onChange={(v:any) => { setUpdatedFabric(v); setBaseDetailsChanged(true); }} 
                  options={storeFabrics}
                  name="fabric"
                />
              </div>
              <input name="fabricDetails" type="text" value={updatedFabricDetails} onChange={(e) => { setUpdatedFabricDetails(e.target.value); setBaseDetailsChanged(true); }} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all text-sm" placeholder="e.g. 100% Pure, Handwoven" />
            </div>
          </div>
          </form>
        </div>

        <div className="pt-2 border-t border-charcoal/10">
          <h3 className="text-lg font-semibold text-charcoal mb-2 border-b border-charcoal/10 pb-1">Variant Management</h3>
          <VariantManager 
            basePrice={product.basePrice}
            variants={variants}
            setVariants={setVariants}
            newVariants={newVariants}
            setNewVariants={setNewVariants}
            deletedVariantIds={deletedVariantIds}
            setDeletedVariantIds={setDeletedVariantIds}
          />
        </div>

        <div className="pt-2 border-t border-charcoal/10">
          <ImageManager 
            images={images} 
            setImages={setImages}
            newImageFiles={newImageFiles}
            setNewImageFiles={setNewImageFiles}
            deletedImageIds={deletedImageIds}
            setDeletedImageIds={setDeletedImageIds}
            primaryImageId={primaryImageId}
            setPrimaryImageId={setPrimaryImageId}
            newPrimaryIndex={newPrimaryIndex}
            setNewPrimaryIndex={setNewPrimaryIndex}
          />
        </div>
      </div>
      
      <div className="sticky bottom-4 z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-teal-200 p-4 shadow-[0_10px_40px_rgba(13,148,136,0.15)] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className={`text-sm font-medium px-4 ${hasChanges ? 'text-amber-600' : 'text-teal-800'}`}>
          {changesText}
        </div>
        <button 
          onClick={handleGlobalSave}
          disabled={!hasChanges || isSavingBulk || isPending}
          className="btn-primary flex items-center justify-center gap-2 py-3 px-10 disabled:opacity-50"
        >
          <Save size={20} /> {isSavingBulk || isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}

function ImageManager({ images, setImages, newImageFiles, setNewImageFiles, deletedImageIds, setDeletedImageIds, primaryImageId, setPrimaryImageId, newPrimaryIndex, setNewPrimaryIndex }: any) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    toast.info(`Optimizing ${files.length} image(s)...`)
    try {
      const options = { maxSizeMB: 7, maxWidthOrHeight: 4000, useWebWorker: true, initialQuality: 0.95 }
      const newFilesArray = await Promise.all(
        Array.from(files).map(async (file) => {
          let finalFile = file;
          if (file.size > 7 * 1024 * 1024) finalFile = await imageCompression(file, options)
          return { file: finalFile, preview: URL.createObjectURL(finalFile) }
        })
      )
      setNewImageFiles((prev: any) => [...prev, ...newFilesArray])
      toast.success("Images optimized!")
    } catch (error) {
      console.error("Compression error:", error)
      toast.error("Compression failed. Using original files.")
      const fallbackArray = Array.from(files).map(file => ({ file, preview: URL.createObjectURL(file) }))
      setNewImageFiles((prev: any) => [...prev, ...fallbackArray])
    }
    e.target.value = ""
  }

  const handleDeleteExisting = (imageId: string) => {
    setDeletedImageIds([...deletedImageIds, imageId])
    if (primaryImageId === imageId) setPrimaryImageId(null)
  }

  const handleDeleteNew = (index: number) => {
    const updated = [...newImageFiles]
    updated.splice(index, 1)
    setNewImageFiles(updated)
    if (newPrimaryIndex === index) setNewPrimaryIndex(null)
    else if (newPrimaryIndex !== null && newPrimaryIndex > index) setNewPrimaryIndex(newPrimaryIndex - 1)
  }

  const handleSetPrimaryExisting = (imageId: string) => {
    setPrimaryImageId(imageId)
    setNewPrimaryIndex(null)
  }

  const handleSetPrimaryNew = (index: number) => {
    setNewPrimaryIndex(index)
    setPrimaryImageId(null)
  }

  const [imageSizes, setImageSizes] = useState<Record<string, string>>({})
  const visibleImages = images.filter((img:any) => !deletedImageIds.includes(img.id))

  useEffect(() => {
    visibleImages.forEach(async (img: any) => {
      if (!imageSizes[img.id]) {
        try {
          const res = await fetch(img.url, { method: 'HEAD' })
          const length = res.headers.get('Content-Length')
          if (length) {
            const mb = (parseInt(length) / (1024 * 1024)).toFixed(2)
            setImageSizes(prev => ({ ...prev, [img.id]: `${mb} MB` }))
          }
        } catch (e) {}
      }
    })
  }, [visibleImages])

  return (
    <div className="pt-2">
      <h3 className="text-lg font-semibold text-charcoal mb-4 border-b border-charcoal/10 pb-2">Product Images</h3>
      <div className="flex flex-wrap gap-4 mb-6">
        {visibleImages.map((img: any) => (
          <div key={img.id} className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-charcoal/10 shadow-sm">
            <img src={img.url} alt={img.alt} className="object-cover w-full h-full" />
            {img.id === primaryImageId && (
              <div className="absolute top-2 left-2 bg-teal-600 text-white rounded-full p-1 shadow-md">
                <Star size={12} className="fill-white" />
              </div>
            )}
            <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] py-1 text-center font-medium backdrop-blur-sm">
              {imageSizes[img.id] || "Loading..."}
            </div>
            <div className="absolute inset-0 bg-charcoal/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
              {img.id !== primaryImageId && (
                <button type="button" onClick={() => handleSetPrimaryExisting(img.id)} className="flex items-center justify-center w-3/4 gap-1 text-[10px] uppercase tracking-wide font-bold text-charcoal bg-gold hover:bg-yellow-400 py-1.5 rounded transition-colors shadow-sm">
                  <Star size={12} className="fill-charcoal" /> Primary
                </button>
              )}
              <button type="button" onClick={() => handleDeleteExisting(img.id)} className="flex items-center justify-center w-3/4 gap-1 text-[10px] uppercase tracking-wide font-bold text-white bg-rose/90 hover:bg-rose py-1.5 rounded transition-colors shadow-sm">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {newImageFiles.map((nimg: any, idx: number) => (
          <div key={idx} className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            <div className="absolute top-0 right-0 bg-sky-500 text-white text-[9px] px-1.5 py-0.5 font-bold rounded-bl-lg z-10 uppercase tracking-wider">New</div>
            <img src={nimg.preview} alt="New Upload" className="object-cover w-full h-full opacity-90" />
            {newPrimaryIndex === idx && (
              <div className="absolute top-2 left-2 bg-teal-600 text-white rounded-full p-1 shadow-md z-10">
                <Star size={12} className="fill-white" />
              </div>
            )}
            <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] py-1 text-center font-medium backdrop-blur-sm z-10">
              {(nimg.file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
            <div className="absolute inset-0 bg-charcoal/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] z-20">
              {newPrimaryIndex !== idx && (
                <button type="button" onClick={() => handleSetPrimaryNew(idx)} className="flex items-center justify-center w-3/4 gap-1 text-[10px] uppercase tracking-wide font-bold text-charcoal bg-gold hover:bg-yellow-400 py-1.5 rounded transition-colors shadow-sm">
                  <Star size={12} className="fill-charcoal" /> Primary
                </button>
              )}
              <button type="button" onClick={() => handleDeleteNew(idx)} className="flex items-center justify-center w-3/4 gap-1 text-[10px] uppercase tracking-wide font-bold text-white bg-rose/90 hover:bg-rose py-1.5 rounded transition-colors shadow-sm">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 rounded-2xl cursor-pointer transition-colors text-sky-800 font-medium">
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
        <Upload size={28} className="mb-2 text-sky-600" />
        <span>Click to add new images</span>
      </label>
    </div>
  )
}

const COLOR_MAP = [
  { name: "Red", hex: "#FF0000" },
  { name: "Crimson", hex: "#DC143C" },
  { name: "Maroon", hex: "#800000" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Coral", hex: "#FF7F50" },
  { name: "Peach", hex: "#FFDAB9" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Green", hex: "#008000" },
  { name: "Lime", hex: "#00FF00" },
  { name: "Olive", hex: "#808000" },
  { name: "Teal", hex: "#008080" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Navy", hex: "#000080" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Purple", hex: "#800080" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Gray", hex: "#808080" },
  { name: "Silver", hex: "#C0C0C0" }
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Unstitched", "Per Meter", "Custom"];

function SizeSelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative w-full h-full">
      <button 
        type="button" 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="w-full h-full flex justify-between items-center text-left focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-transparent px-2 rounded-lg"
      >
        <span className="truncate pr-2 font-medium">{value}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-teal-600' : 'text-slate-400'}`} />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-xl border border-charcoal/10 z-50 overflow-hidden max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
            {SIZE_OPTIONS.map(s => (
              <div 
                key={s}
                onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false); }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${value === s ? 'bg-teal-50 text-teal-700 font-bold border-l-4 border-teal-600 pl-2' : 'text-charcoal hover:bg-slate-50 border-l-4 border-transparent pl-3'}`}
              >
                {s}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function getNearestColorName(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "";
  let minDistance = Infinity;
  let closestName = "";
  for (const color of COLOR_MAP) {
    const cRgb = hexToRgb(color.hex);
    if (!cRgb) continue;
    const dist = Math.pow(rgb.r - cRgb.r, 2) + Math.pow(rgb.g - cRgb.g, 2) + Math.pow(rgb.b - cRgb.b, 2);
    if (dist < minDistance) { minDistance = dist; closestName = color.name; }
  }
  return closestName;
}

function VariantManager({ basePrice, variants, setVariants, newVariants, setNewVariants, deletedVariantIds, setDeletedVariantIds }: any) {
  const [newHex, setNewHex] = useState("#000000");
  const [newColorName, setNewColorName] = useState("Black");
  const [newSize, setNewSize] = useState("Free Size");

  const handleHexChange = (hex: string) => {
    setNewHex(hex);
    if (hex.match(/^#[0-9a-fA-F]{6}$/)) {
      const name = getNearestColorName(hex);
      if (name) setNewColorName(name);
    }
  }

  const handleAddVariant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const nv = {
      tempId: Date.now().toString(),
      color: formData.get("color") as string,
      colorHex: formData.get("colorHex") as string,
      size: newSize,
      price: parseFloat((formData.get("price") as string) || basePrice.toString()),
      stock: parseInt(formData.get("stock") as string || "10")
    }
    setNewVariants([...newVariants, nv])
    form.reset()
    setNewHex("#000000")
    setNewColorName("Black")
    setNewSize("Free Size")
  }

  const handleDeleteExisting = (id: string) => setDeletedVariantIds([...deletedVariantIds, id])
  const handleDeleteNew = (tempId: string) => setNewVariants(newVariants.filter((v:any) => v.tempId !== tempId))

  const handleUpdateExisting = (id: string, field: string, val: any) => setVariants((prev: any[]) => prev.map((v:any) => v.id === id ? { ...v, [field]: val } : v))
  const handleUpdateNew = (tempId: string, field: string, val: any) => setNewVariants((prev: any[]) => prev.map((v:any) => v.tempId === tempId ? { ...v, [field]: val } : v))

  const visibleVariants = variants.filter((v:any) => !deletedVariantIds.includes(v.id))

  return (
    <div>
      <div className="space-y-3 mb-8 overflow-x-auto pb-4">
        <div className="min-w-[600px] space-y-1.5">
        {(visibleVariants.length > 0 || newVariants.length > 0) && (
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-2 pb-1 border-b border-charcoal/10">
            <div className="text-sm font-bold text-charcoal">Color Code</div>
            <div className="text-sm font-bold text-charcoal">Color Name</div>
            <div className="text-sm font-bold text-charcoal">Size</div>
            <div className="text-sm font-bold text-charcoal">Price</div>
            <div className="text-sm font-bold text-charcoal">Qty</div>
            <div className="text-sm font-bold text-charcoal text-center">Action</div>
          </div>
        )}
        {visibleVariants.map((v:any) => (
          <VariantRow key={v.id} variant={v} onUpdate={(f:any, val:any) => handleUpdateExisting(v.id, f, val)} onDelete={() => handleDeleteExisting(v.id)} />
        ))}
        {newVariants.map((v:any) => (
          <VariantRow key={v.tempId} variant={v} isNew onUpdate={(f:any, val:any) => handleUpdateNew(v.tempId, f, val)} onDelete={() => handleDeleteNew(v.tempId)} />
        ))}
        {(visibleVariants.length === 0 && newVariants.length === 0) && (
          <div className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            No variants created yet.
          </div>
        )}
        </div>
      </div>

      <h4 className="font-semibold text-charcoal mb-3 text-sm">Add New Variant</h4>
      <form onSubmit={handleAddVariant} className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl border border-charcoal/10 shadow-sm shadow-charcoal/5">
        <input type="hidden" name="color" value={newColorName} />
        <div className="w-[110px]">
          <label className="block text-xs font-bold text-slate-600 mb-1">Color (Hex)</label>
          <div className="flex items-center gap-1 bg-slate-50 border border-charcoal/10 rounded-lg h-10 px-1 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600">
            <input name="colorHex" type="text" value={newHex} onChange={(e) => handleHexChange(e.target.value)} placeholder="#HEX" className="w-16 bg-transparent text-sm font-mono uppercase focus:outline-none pl-1" />
            <input type="color" value={newHex} onChange={(e) => handleHexChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-none p-0 bg-transparent shrink-0" />
          </div>
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-xs font-bold text-slate-600 mb-1">Size</label>
          <div className="w-full h-10 text-sm rounded-lg border border-charcoal/10 bg-slate-50 relative group">
            <SizeSelect value={newSize} onChange={setNewSize} />
          </div>
        </div>
        <div className="w-24">
          <label className="block text-xs font-bold text-slate-600 mb-1">Price (₹)</label>
          <input required name="price" type="number" defaultValue={basePrice} className="w-full p-2.5 text-sm rounded-lg border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50" />
        </div>
        <div className="w-20">
          <label className="block text-xs font-bold text-slate-600 mb-1">Stock</label>
          <input required name="stock" type="number" min="0" defaultValue="10" className="w-full p-2.5 text-sm rounded-lg border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50" />
        </div>
        <button type="submit" className="p-2 h-10 w-10 flex items-center justify-center text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95" title="Add Variant">
          <Plus size={20} strokeWidth={3} />
        </button>
      </form>
    </div>
  )
}

function VariantRow({ variant, onUpdate, onDelete, isNew }: any) {
  const handleHexChange = (hex: string) => {
    onUpdate("colorHex", hex);
    if (hex.match(/^#[0-9a-fA-F]{6}$/)) {
      const name = getNearestColorName(hex);
      if (name) onUpdate("color", name);
    }
  };

  return (
    <div className={`grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 p-1.5 rounded-xl border transition-colors group ${isNew ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-charcoal/5 hover:border-teal-200'}`}>
      <div className="flex items-center gap-1 w-full">
        <input type="color" value={variant.colorHex} onChange={e => handleHexChange(e.target.value)} className="w-7 h-7 rounded-full cursor-pointer border-none p-0 bg-transparent shrink-0" title="Pick Color" />
        <input type="text" value={variant.colorHex} onChange={e => handleHexChange(e.target.value)} className="w-full min-w-0 py-1.5 px-2 text-xs font-mono font-medium rounded-lg border border-transparent hover:border-charcoal/20 focus:border-teal-600 focus:bg-white outline-none transition-all bg-transparent uppercase" />
      </div>
      <input type="text" value={variant.color} onChange={e => onUpdate("color", e.target.value)} className="w-full min-w-0 py-1.5 px-2 text-sm font-medium rounded-lg border border-transparent hover:border-charcoal/20 focus:border-teal-600 focus:bg-white outline-none transition-all bg-transparent" />
      <div className="w-full min-w-0">
        <div className="w-full h-8 rounded-lg border border-transparent hover:border-charcoal/20 focus-within:border-teal-600 focus-within:bg-white transition-all bg-transparent">
          <SizeSelect value={variant.size} onChange={val => onUpdate("size", val)} />
        </div>
      </div>
      <div className="flex items-center gap-1 w-full min-w-0 relative">
        <span className="text-xs text-slate font-bold absolute left-2 pointer-events-none">₹</span>
        <input type="number" value={variant.price} onChange={e => onUpdate("price", Number(e.target.value))} className="w-full pl-5 py-1.5 px-2 text-sm font-bold text-teal-700 rounded-lg border border-transparent hover:border-charcoal/20 focus:border-teal-600 focus:bg-white outline-none transition-all bg-transparent" />
      </div>
      <div className="w-full min-w-0">
        <input type="number" value={variant.stock} onChange={e => onUpdate("stock", Number(e.target.value))} className="w-full py-1.5 px-2 text-sm font-bold text-charcoal rounded-lg border border-transparent hover:border-charcoal/20 focus:border-teal-600 focus:bg-white outline-none transition-all bg-transparent" />
      </div>
      <button type="button" onClick={onDelete} className="justify-self-center p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-lg border border-rose-100 transition-all active:scale-95 shrink-0" title="Remove Variant">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

const CategorySelect = ({ selected, onChange, options, name }: { selected: string[], onChange: (v: string[]) => void, options: {value: string, label: string}[], name?: string }) => {
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

  const missingOptions = selected.filter(val => !options.some(o => o.value === val))
  const validOptionsCount = selected.length - missingOptions.length

  const getLabel = () => {
    if (selected.length === 0) return "Select categories..."
    if (selected.length === 1) return options.find(o => o.value === selected[0])?.label || selected[0]
    return `${selected.length} selected`
  }
  return (
    <div className="relative" ref={dropdownRef}>
      {name && <input type="hidden" name={name} value={JSON.stringify(selected)} />}
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-charcoal/20 rounded-xl px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm flex justify-between items-center">
        <span className={selected.length === 0 ? "text-slate" : "text-charcoal"}>{getLabel()}</span>
        <ChevronDown size={16} className={cn("text-slate transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-charcoal/10 rounded-xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto no-scrollbar">
          {missingOptions.map(val => (
            <label key={val} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate/5 rounded-lg cursor-pointer group transition-colors">
              <input type="checkbox" checked={true} onChange={() => onChange(selected.filter(v => v !== val))} className="w-4 h-4 rounded border-2 border-rose-300 text-rose-500 focus:ring-rose-500 cursor-pointer accent-rose-500" />
              <span className="text-sm text-rose-500 font-medium">{val} <span className="text-xs text-rose-400 font-normal">(Deleted Category)</span></span>
            </label>
          ))}
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate/5 rounded-lg cursor-pointer group transition-colors">
              <input type="checkbox" checked={selected.includes(opt.value)} onChange={(e) => { if (e.target.checked) onChange([...selected, opt.value]); else onChange(selected.filter(v => v !== opt.value)) }} className="w-4 h-4 rounded border-2 border-charcoal/20 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600" />
              <span className="text-sm text-charcoal">{opt.label}</span>
            </label>
          ))}
          {options.length === 0 && missingOptions.length === 0 && <div className="px-3 py-2 text-sm text-slate">No categories configured.</div>}
        </div>
      )}
    </div>
  )
}

const FabricSelect = ({ value, onChange, options, name }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], name?: string }) => {
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

  const selectedLabel = options.find(o => o.value === value)?.label || value || "Select fabric..."

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {name && <input type="hidden" name={name} value={value} />}
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-charcoal/20 rounded-xl px-4 py-2.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm flex justify-between items-center">
        <span className={!value ? "text-slate" : "text-charcoal"}>{selectedLabel}</span>
        <ChevronDown size={16} className={cn("text-slate transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-charcoal/10 rounded-xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto no-scrollbar">
          {value && !options.some(o => o.value === value) && (
            <button type="button" onClick={() => { onChange(value); setIsOpen(false) }} className="w-full text-left flex items-center gap-2.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer group transition-colors">
              <div className="w-4 h-4 rounded-full border-2 border-rose-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
              <span className="text-sm text-rose-600 font-medium">{value} <span className="text-xs text-rose-400 font-normal">(Deleted Fabric)</span></span>
            </button>
          )}
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false) }} className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate/5 rounded-lg cursor-pointer group transition-colors">
              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0", value === opt.value ? "border-teal-600" : "border-charcoal/20 group-hover:border-teal-600")}>
                {value === opt.value && <div className="w-2 h-2 rounded-full bg-teal-600" /> }
              </div>
              <span className="text-sm text-charcoal">{opt.label}</span>
            </button>
          ))}
          {options.length === 0 && <div className="px-3 py-2 text-sm text-slate">No fabrics configured.</div>}
        </div>
      )}
    </div>
  )
}
