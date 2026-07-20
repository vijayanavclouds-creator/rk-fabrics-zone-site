"use client"

import { useState, useTransition, useEffect } from "react"
import { updateProduct, createProduct, deleteProduct, bulkUpdateImagesAndVariants } from "@/actions/admin"
import { toast } from "sonner"
import { Save, Upload, X, Star, Trash2, Plus, Edit, Image as ImageIcon, ChevronDown, LayoutTemplate, Activity, User } from "lucide-react"
import Image from "next/image"

import { BannerManager } from "./banner-manager"
import { SystemStatus } from "./system-status"
import { UsersManager } from "./users-manager"
import { OrdersManager } from "./orders-manager"

export function AdminDashboard({ products, initialBanners = [] }: { products: any[], initialBanners?: any[] }) {
  const [activeView, setActiveView] = useState<"list" | "new" | "edit" | "banners" | "system" | "users" | "orders">("list")
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isPending, startTransition] = useTransition()

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

  const handleDeleteProduct = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return
    startTransition(async () => {
      const res = await deleteProduct(id)
      if (res.success) toast.success(`Deleted ${name}!`)
      else toast.error("Failed to delete product")
    })
  }

  if (activeView === "new") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center bg-white rounded-2xl border border-charcoal/10 px-8 py-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-charcoal">
            Create New Product
          </h2>
          <button 
            onClick={() => { setActiveView("list"); setEditingProduct(null); }}
            className="flex items-center justify-center p-2.5 text-slate-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
            title="Close"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
        <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br from-white to-cream/20">
          <h3 className="text-xl font-semibold text-charcoal mb-6 border-b border-charcoal/10 pb-3">Base Details</h3>
          <form action={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Product Name</label>
              <input required name="name" type="text" className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" placeholder="e.g. Elegant Silk Saree" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Category</label>
              <CategorySelect defaultValue="women-ethnic" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Base Price (MRP ₹)</label>
              <input required name="basePrice" type="number" min="0" className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" placeholder="999" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Discount (%)</label>
              <input name="discountPercent" type="number" min="0" max="100" defaultValue={0} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Initial Stock</label>
              <input required name="stock" type="number" min="0" className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" placeholder="10" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Size</label>
              <input name="size" type="text" defaultValue="Free Size" className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Color</label>
              <input name="color" type="text" defaultValue="Default" className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isFreeDelivery" value="true" defaultChecked={true} id="isFreeDelivery" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
                <label htmlFor="isFreeDelivery" className="text-sm font-bold text-charcoal cursor-pointer">Free Delivery</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isNewArrival" value="true" defaultChecked={false} id="isNewArrival" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
                <label htmlFor="isNewArrival" className="text-sm font-bold text-charcoal cursor-pointer">New Arrival</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isBestseller" value="true" defaultChecked={false} id="isBestseller" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
                <label htmlFor="isBestseller" className="text-sm font-bold text-charcoal cursor-pointer">Bestseller</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isFeatured" value="true" defaultChecked={false} id="isFeatured" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
                <label htmlFor="isFeatured" className="text-sm font-bold text-charcoal cursor-pointer">Featured</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isOnSale" value="true" defaultChecked={false} id="isOnSale" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
                <label htmlFor="isOnSale" className="text-sm font-bold text-charcoal cursor-pointer">On Sale</label>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end mt-4 pt-6 border-t border-charcoal/10">
              <button disabled={isPending} type="submit" className="flex items-center justify-center gap-2 py-3 px-8 text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(13,148,136,0.39)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.23)] hover:-translate-y-0.5 active:translate-y-1 active:border-b-transparent border-b-4 border-b-teal-900 bg-gradient-to-br from-teal-500 to-teal-700 disabled:opacity-50 text-base">
                <Save size={20} /> {isPending ? "Saving..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (activeView === "edit" && editingProduct) {
    return (
      <ProductEditor 
        product={editingProduct} 
        onClose={() => { setActiveView("list"); setEditingProduct(null); }} 
      />
    )
  }

  // LIST VIEW
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveView("list")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeView === "list" ? "bg-white text-charcoal shadow-sm" : "text-slate hover:text-charcoal"}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveView("orders")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeView === "orders" ? "bg-white text-charcoal shadow-sm" : "text-slate hover:text-charcoal"}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveView("banners")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeView === "banners" ? "bg-white text-charcoal shadow-sm" : "text-slate hover:text-charcoal"}`}
          >
            <LayoutTemplate size={16} /> Banners
          </button>
          <button 
            onClick={() => setActiveView("system")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeView === "system" ? "bg-white text-charcoal shadow-sm" : "text-slate hover:text-charcoal"}`}
          >
            <Activity size={16} /> System
          </button>
          <button 
            onClick={() => setActiveView("users")}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeView === "users" ? "bg-white text-charcoal shadow-sm" : "text-slate hover:text-charcoal"}`}
          >
            <User size={16} /> Users
          </button>
        </div>
        
        {activeView === "list" && (
          <button 
            onClick={() => setActiveView("new")}
            className="flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-neo-btn hover:-translate-y-1 w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> Add Product
          </button>
        )}
      </div>

      {activeView === "banners" && (
        <BannerManager banners={initialBanners} />
      )}

      {activeView === "system" && (
        <SystemStatus />
      )}

      {activeView === "users" && <UsersManager />}
      {activeView === "orders" && <OrdersManager />}

      {activeView === "list" && (
        <div className="bg-white rounded-3xl border border-charcoal/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br from-white to-cream/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-dark/30 border-b border-charcoal/10">
              <th className="p-5 font-bold text-charcoal min-w-[200px]">Product Name</th>
              <th className="p-5 font-bold text-charcoal w-40 whitespace-nowrap">Category</th>
              <th className="p-5 font-bold text-charcoal w-32 whitespace-nowrap">MRP (₹)</th>
              <th className="p-5 font-bold text-charcoal w-28 whitespace-nowrap">Disc.</th>
              <th className="p-5 font-bold text-charcoal w-24">Images</th>
              <th className="p-5 font-bold text-charcoal w-24">Variants</th>
              <th className="p-5 font-bold text-charcoal w-48 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-charcoal/5 hover:bg-cream/40 transition-colors group">
                <td className="p-5">
                  <span className="font-semibold text-charcoal block group-hover:text-teal-700 transition-colors">{product.name}</span>
                  <span className="text-xs text-slate mt-1 block">Slug: {product.slug}</span>
                  {product.isFreeDelivery && <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">Free Delivery</span>}
                </td>
                <td className="p-5 text-charcoal font-medium capitalize whitespace-nowrap">
                  {(() => {
                    try {
                      const cats = JSON.parse(product.category);
                      if (Array.isArray(cats)) return cats.map(c => c.replace("-", " ")).join(", ");
                    } catch(e) {}
                    return String(product.category).replace("-", " ");
                  })()}
                </td>
                <td className="p-5 text-charcoal font-bold whitespace-nowrap">₹{product.basePrice}</td>
                <td className="p-5 whitespace-nowrap">
                  {product.discountPercent > 0 ? (
                    <span className="text-rose font-bold bg-rose-50 px-2 py-1 rounded text-sm border border-rose-100 whitespace-nowrap">{product.discountPercent}% OFF</span>
                  ) : <span className="text-slate-400">-</span>}
                </td>
                <td className="p-5 text-slate font-medium">
                  <div className="flex items-center gap-1">
                    <ImageIcon size={14} className="text-teal-600" /> {product.images?.length || 0}
                  </div>
                </td>
                <td className="p-5 text-slate font-medium">{product.variants?.length || 0}</td>
                <td className="p-5">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => { setEditingProduct(product); setActiveView("edit") }}
                      className="flex items-center justify-center gap-2 py-2 px-5 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-1 active:border-b-transparent border-b-4 border-b-slate-900 bg-slate-700 hover:bg-slate-800 text-sm whitespace-nowrap"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      disabled={isPending}
                      className="flex items-center justify-center gap-2 py-2 px-5 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-1 active:border-b-transparent border-b-4 border-b-rose-950 bg-rose-800 hover:bg-rose-900 disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductEditor({ product, onClose }: { product: any, onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [isSavingBulk, setIsSavingBulk] = useState(false)

  // Variant State
  const [variants, setVariants] = useState<any[]>(product.variants || [])
  const [newVariants, setNewVariants] = useState<any[]>([])
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([])

  // Image State
  const [images, setImages] = useState<any[]>(product.images || [])
  const [newImageFiles, setNewImageFiles] = useState<{file: File, preview: string}[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(product.images?.find((i:any)=>i.isPrimary)?.id || null)
  const [newPrimaryIndex, setNewPrimaryIndex] = useState<number | null>(null)

  const handleUpdateBaseDetails = (formData: FormData) => {
    formData.append("id", product.id)
    startTransition(async () => {
      const res = await updateProduct(formData)
      if (res.success) toast.success("Base details updated!")
      else toast.error(res.error || "Failed to update base details")
    })
  }

  const handleBulkSave = () => {
    setIsSavingBulk(true)
    
    // Find variants that were updated (existing variants whose properties changed)
    const updatedVariants = variants.filter(v => {
      const original = product.variants.find((ov:any) => ov.id === v.id)
      if (!original) return false
      return original.size !== v.size || original.color !== v.color || original.colorHex !== v.colorHex || original.price !== v.price || original.stock !== v.stock
    })

    const payload = {
      productId: product.id,
      newVariants,
      updatedVariants,
      deletedVariantIds,
      deletedImageIds,
      primaryImageId,
      newPrimaryIndex
    }

    const formData = new FormData()
    formData.append("payload", JSON.stringify(payload))
    newImageFiles.forEach(ni => formData.append("images", ni.file))

    startTransition(async () => {
      const res = await bulkUpdateImagesAndVariants(formData)
      if (res.success) {
        toast.success("Images and Variants saved successfully!")
        setNewVariants([])
        setNewImageFiles([])
        setDeletedVariantIds([])
        setDeletedImageIds([])
      } else {
        toast.error(res.error || "Failed to save")
      }
      setIsSavingBulk(false)
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center bg-white rounded-2xl border border-charcoal/10 px-8 py-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-charcoal">
          Edit Product
        </h2>
        <button 
          onClick={onClose}
          className="flex items-center justify-center p-2.5 text-slate-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
          title="Close"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br from-white to-cream/20">
        <h3 className="text-xl font-semibold text-charcoal mb-6 border-b border-charcoal/10 pb-3">Base Details</h3>
        <form action={handleUpdateBaseDetails} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Product Name</label>
            <input required name="name" type="text" defaultValue={product.name} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Category</label>
            <CategorySelect defaultValue={product.category || "women-ethnic"} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Base Price (MRP ₹)</label>
            <input required name="basePrice" type="number" min="0" defaultValue={product.basePrice} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Discount (%)</label>
            <input name="discountPercent" type="number" min="0" max="100" defaultValue={product.discountPercent || 0} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-slate-50 transition-all" />
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isFreeDelivery" value="true" defaultChecked={product.isFreeDelivery} id="isFreeDeliveryEdit" className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 accent-teal-600" />
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
          </div>
          <div className="md:col-span-2 flex justify-end mt-4 pt-6 border-t border-charcoal/10">
            <button disabled={isPending} type="submit" className="flex items-center justify-center gap-2 py-3 px-8 text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(13,148,136,0.39)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.23)] hover:-translate-y-0.5 active:translate-y-1 active:border-b-transparent border-b-4 border-b-teal-900 bg-gradient-to-br from-teal-500 to-teal-700 disabled:opacity-50 text-base">
              <Save size={20} /> {isPending ? "Saving..." : "Save Base Details"}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
        <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br from-white to-cream/20">
          <h3 className="text-xl font-semibold text-charcoal mb-6 border-b border-charcoal/10 pb-3">Variant Management</h3>
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
      </div>
      
      <div className="sticky bottom-4 z-10 bg-white/90 backdrop-blur-md rounded-2xl border border-teal-200 p-4 shadow-[0_10px_40px_rgba(13,148,136,0.15)] flex justify-between items-center">
        <div className="text-sm text-teal-800 font-medium px-4">
          Unsaved changes to Images ({newImageFiles.length + deletedImageIds.length}) or Variants ({newVariants.length + deletedVariantIds.length})?
        </div>
        <button 
          onClick={handleBulkSave}
          disabled={isSavingBulk || isPending}
          className="flex items-center justify-center gap-2 py-3 px-10 text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] hover:-translate-y-0.5 active:translate-y-1 active:border-b-transparent border-b-4 border-b-slate-900 bg-gradient-to-br from-slate-700 to-slate-800 disabled:opacity-50 text-base"
        >
          <Save size={20} /> {isSavingBulk ? "Saving..." : "Save Images & Variants"}
        </button>
      </div>
    </div>
  )
}

function ImageManager({ images, setImages, newImageFiles, setNewImageFiles, deletedImageIds, setDeletedImageIds, primaryImageId, setPrimaryImageId, newPrimaryIndex, setNewPrimaryIndex }: any) {
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const newFilesArray = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    
    setNewImageFiles([...newImageFiles, ...newFilesArray])
    
    // Reset the input so the same files can be selected again if needed
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

  const visibleImages = images.filter((img:any) => !deletedImageIds.includes(img.id))

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-gradient-to-br from-white to-cream/20">
      <h3 className="text-xl font-semibold text-charcoal mb-6 border-b border-charcoal/10 pb-3">Product Images</h3>
      
      <div className="flex flex-wrap gap-4 mb-6">
        {visibleImages.map((img: any) => (
          <div key={img.id} className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-charcoal/10 shadow-sm">
            <img src={img.url} alt={img.alt} className="object-cover w-full h-full" />
            {img.id === primaryImageId && (
              <div className="absolute top-2 left-2 bg-teal-600 text-white rounded-full p-1 shadow-md">
                <Star size={12} className="fill-white" />
              </div>
            )}
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

function VariantManager({ basePrice, variants, setVariants, newVariants, setNewVariants, deletedVariantIds, setDeletedVariantIds }: any) {
  
  const handleAddVariant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const nv = {
      tempId: Date.now().toString(),
      color: formData.get("color") as string,
      colorHex: formData.get("colorHex") as string,
      size: formData.get("size") as string,
      price: parseFloat((formData.get("price") as string) || basePrice.toString()),
      stock: parseInt(formData.get("stock") as string || "10")
    }
    
    setNewVariants([...newVariants, nv])
    form.reset()
  }

  const handleDeleteExisting = (id: string) => {
    setDeletedVariantIds([...deletedVariantIds, id])
  }
  const handleDeleteNew = (tempId: string) => {
    setNewVariants(newVariants.filter((v:any) => v.tempId !== tempId))
  }

  const handleUpdateExisting = (id: string, field: string, val: any) => {
    setVariants(variants.map((v:any) => v.id === id ? { ...v, [field]: val } : v))
  }
  const handleUpdateNew = (tempId: string, field: string, val: any) => {
    setNewVariants(newVariants.map((v:any) => v.tempId === tempId ? { ...v, [field]: val } : v))
  }

  const visibleVariants = variants.filter((v:any) => !deletedVariantIds.includes(v.id))

  return (
    <div>
      <div className="space-y-3 mb-8">
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

      <h4 className="font-semibold text-charcoal mb-3 text-sm">Add New Variant</h4>
      <form onSubmit={handleAddVariant} className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-xl border border-charcoal/10 shadow-sm shadow-charcoal/5">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-bold text-slate-600 mb-1">Color Name</label>
          <input required name="color" type="text" placeholder="e.g. Red" className="w-full p-2.5 text-sm rounded-lg border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50" />
        </div>
        <div className="w-14">
          <label className="block text-xs font-bold text-slate-600 mb-1 text-center">Hex</label>
          <input name="colorHex" type="color" defaultValue="#000000" className="w-full h-10 rounded-lg cursor-pointer border border-charcoal/10 p-0.5 bg-slate-50" />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-xs font-bold text-slate-600 mb-1">Size</label>
          <input required name="size" type="text" placeholder="e.g. XL" className="w-full p-2.5 text-sm rounded-lg border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-slate-50" />
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
  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl border transition-colors group ${isNew ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-charcoal/5 hover:border-teal-200'}`}>
      <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm ml-1" style={{ backgroundColor: variant.colorHex }} title={variant.colorHex} />
      <input type="text" value={variant.color} onChange={e => onUpdate("color", e.target.value)} className="flex-1 min-w-[90px] p-2 text-sm font-medium rounded-lg border border-transparent hover:border-charcoal/20 focus:border-teal-600 focus:bg-white outline-none transition-all bg-transparent" />
      <input type="text" value={variant.size} onChange={e => onUpdate("size", e.target.value)} className="flex-1 min-w-[80px] p-2 text-sm font-medium rounded-lg border border-transparent hover:border-charcoal/20 focus:border-teal-600 focus:bg-white outline-none transition-all bg-transparent" />
      <div className="flex items-center gap-1 w-24 relative">
        <span className="text-xs text-slate font-bold absolute left-2 pointer-events-none">₹</span>
        <input type="number" value={variant.price} onChange={e => onUpdate("price", Number(e.target.value))} className="w-full pl-6 p-2 text-sm font-bold text-teal-700 rounded-lg border border-transparent hover:border-charcoal/20 focus:border-teal-600 focus:bg-white outline-none transition-all bg-transparent" />
      </div>
      <div className="flex items-center gap-1 w-20 relative">
        <span className="text-[10px] uppercase text-slate font-bold absolute left-2 pointer-events-none">Qty</span>
        <input type="number" value={variant.stock} onChange={e => onUpdate("stock", Number(e.target.value))} className="w-full pl-8 p-2 text-sm font-bold text-charcoal rounded-lg border border-transparent hover:border-charcoal/20 focus:border-teal-600 focus:bg-white outline-none transition-all bg-transparent" />
      </div>
      <button type="button" onClick={onDelete} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 rounded-lg border border-rose-100 transition-all active:scale-95" title="Remove Variant">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function CategorySelect({ defaultValue }: { defaultValue: string }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(defaultValue);
      return Array.isArray(parsed) ? parsed : [defaultValue];
    } catch(e) {
      return defaultValue ? [defaultValue] : [];
    }
  })
  const options = [
    { value: "women-ethnic", label: "Women's Ethnic" },
    { value: "women-western", label: "Women's Western" },
    { value: "men-ethnic", label: "Men's Ethnic" },
    { value: "men-formal", label: "Men's Formal" },
    { value: "men-casual", label: "Men's Casual" },
    { value: "fabrics", label: "Fabrics" },
    { value: "unstitched", label: "Unstitched" },
    { value: "accessories", label: "Accessories" },
  ]
  
  const getLabel = () => {
    if (selected.length === 0) return "Select Categories"
    if (selected.length === 1) return options.find(o => o.value === selected[0])?.label || "Unknown"
    return `${selected.length} Categories Selected`
  }

  const toggleOption = (val: string) => {
    setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  return (
    <div className="relative">
      <input type="hidden" name="category" value={JSON.stringify(selected)} />
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 shadow-inner bg-white text-charcoal transition-all flex justify-between items-center text-left"
      >
        <span>{getLabel()}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180 text-teal-600' : 'text-slate-400'}`} />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-charcoal/10 z-50 overflow-hidden max-h-[240px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
            {options.map(opt => (
              <label
                key={opt.value}
                className={`w-full flex items-center px-4 py-3 text-sm transition-colors cursor-pointer ${selected.includes(opt.value) ? 'bg-teal-50 text-teal-700 font-bold border-l-4 border-teal-600 pl-3' : 'text-charcoal hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <input 
                  type="checkbox" 
                  checked={selected.includes(opt.value)} 
                  onChange={() => toggleOption(opt.value)} 
                  className="mr-3 w-4 h-4 rounded text-teal-600 focus:ring-teal-600" 
                />
                {opt.label}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
