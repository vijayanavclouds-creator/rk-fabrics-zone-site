"use client";

import { useState, useEffect } from "react";
import { getCompanyProfile, saveCompanyProfile } from "@/actions/system";
import { toast } from "sonner";
import { Save, Link as LinkIcon, Phone, Mail, User, Globe, MapPin, Building2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon, LinkedinIcon, PinterestIcon, ThreadsIcon, WhatsAppIcon } from "@/components/icons/social";

export function CompanyProfileManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    instagramUrl: "",
    facebookUrl: "",
    xUrl: "",
    threadsUrl: "",
    pinterestUrl: "",
    linkedinUrl: "",
    whatsappUrl: "",
    contactNumber: "",
    helpCenterNumber: "",
    supportEmail: "",
    ownerName: "",
    websiteUrl: "",
    address: "",
    companyDescription: "",
    gstNumber: "",
    panNumber: "",
    signatureUrl: "",
    gstPriceThreshold: 2500,
    gstPercentBelowThreshold: 5,
    gstPercentAboveThreshold: 18,
    shippingFee: 79,
    expressShippingFee: 150,
    platformFeePercent: 2
  });

  const [uploadingSignature, setUploadingSignature] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const data = await getCompanyProfile();
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingSignature(true);
    toast.loading("Uploading signature...");
    
    try {
      const { getCloudinarySignature } = await import('@/actions/admin');
      const sigData = await getCloudinarySignature("rk-fabrics/signatures");
      if (!sigData.success || !sigData.signature || !sigData.apiKey || !sigData.cloudName) {
        throw new Error("Failed to get upload signature from server");
      }

      const createData = new FormData();
      createData.append("file", file);
      createData.append("api_key", sigData.apiKey);
      createData.append("timestamp", sigData.timestamp!.toString());
      createData.append("signature", sigData.signature);
      createData.append("folder", "rk-fabrics/signatures");
      createData.append("use_filename", "true");
      createData.append("unique_filename", "true");

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: "POST",
        body: createData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Upload failed");

      setProfile(prev => ({ ...prev, signatureUrl: uploadData.secure_url }));
      toast.dismiss();
      toast.success("Signature uploaded! Remember to save the profile.");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to upload signature");
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check HTML5 native validation
    if (!e.currentTarget.checkValidity()) {
      const invalidElements = e.currentTarget.querySelectorAll(':invalid');
      if (invalidElements.length > 0) {
        const firstInvalid = invalidElements[0] as HTMLInputElement;
        const name = firstInvalid.name || "Field";
        const label = name.replace(/([A-Z])/g, ' $1').trim().replace(/Url/i, 'URL');
        const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
        
        if (firstInvalid.type === 'url') {
          toast.error(`Please enter a valid URL for ${formattedLabel} (must include http:// or https://)`);
        } else {
          toast.error(`Please enter a valid value for ${formattedLabel}`);
        }
        
        firstInvalid.focus();
        return;
      }
    }

    setSaving(true);
    toast.loading("Saving company profile...");
    
    const res = await saveCompanyProfile(profile);
    
    toast.dismiss();
    if (res.success) {
      toast.success("Company profile saved successfully!");
    } else {
      toast.error(res.error || "Failed to save profile.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-6 border-b border-charcoal/10 pb-4">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal flex items-center gap-2">
          <Building2 className="text-teal-600" size={28} />
          Company Profile Settings
        </h2>
        <p className="text-slate mt-1 text-sm">
          Update the global contact information, social links, and company details that appear across the platform.
        </p>
      </div>

      <div className="bg-white p-4 sm:p-6 -mx-4 sm:mx-0 rounded-none sm:rounded-3xl border-y sm:border border-charcoal/10 shadow-sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-4 md:space-y-8">
        {/* Social Media & Links */}
        <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-charcoal/5">
          <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-charcoal/10 pb-2">
            <Globe className="text-blue-500" size={20} /> Social & Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <InstagramIcon size={16} className="text-pink-600" /> Instagram URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={profile.instagramUrl || ""}
                onChange={handleChange}
                placeholder="https://instagram.com/yourstore"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <FacebookIcon size={16} className="text-blue-600" /> Facebook URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={profile.facebookUrl || ""}
                onChange={handleChange}
                placeholder="https://facebook.com/yourstore"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <TwitterIcon size={16} className="text-slate-800" /> X (Twitter) URL
              </label>
              <input
                type="url"
                name="xUrl"
                value={profile.xUrl || ""}
                onChange={handleChange}
                placeholder="https://x.com/yourstore"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <ThreadsIcon size={16} className="text-slate-900" /> Threads URL
              </label>
              <input
                type="url"
                name="threadsUrl"
                value={profile.threadsUrl || ""}
                onChange={handleChange}
                placeholder="https://threads.net/@yourstore"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <PinterestIcon size={16} className="text-red-600" /> Pinterest URL
              </label>
              <input
                type="url"
                name="pinterestUrl"
                value={profile.pinterestUrl || ""}
                onChange={handleChange}
                placeholder="https://pinterest.com/yourstore"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <LinkedinIcon size={16} className="text-blue-700" /> LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={profile.linkedinUrl || ""}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/yourstore"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <WhatsAppIcon size={16} className="text-green-600" /> WhatsApp URL
              </label>
              <input
                type="url"
                name="whatsappUrl"
                value={profile.whatsappUrl || ""}
                onChange={handleChange}
                placeholder="https://wa.me/1234567890"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <Globe size={16} /> Website URL (Main/Blog)
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={profile.websiteUrl || ""}
                onChange={handleChange}
                placeholder="https://rkfabricszone.com"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-charcoal/5">
          <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-charcoal/10 pb-2">
            <Phone className="text-emerald-600" size={20} /> Contact & Support
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <Phone size={16} /> Contact Number
              </label>
              <input
                type="text"
                name="contactNumber"
                value={profile.contactNumber || ""}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <Phone size={16} /> Help Center Number
              </label>
              <input
                type="text"
                name="helpCenterNumber"
                value={profile.helpCenterNumber || ""}
                onChange={handleChange}
                placeholder="1800-123-4567"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <Mail size={16} /> Support Email
              </label>
              <input
                type="email"
                name="supportEmail"
                value={profile.supportEmail || ""}
                onChange={handleChange}
                placeholder="support@rkfabricszone.com"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <User size={16} /> Owner / Entity Name
              </label>
              <input
                type="text"
                name="ownerName"
                value={profile.ownerName || ""}
                onChange={handleChange}
                placeholder="RK Fabrics Zone Pvt Ltd"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <Building2 size={16} /> GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                value={profile.gstNumber || ""}
                onChange={handleChange}
                placeholder="08XXXXX1234X1ZX"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <Building2 size={16} /> PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                value={profile.panNumber || ""}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <MapPin size={16} /> Registered Address
              </label>
              <textarea
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Full registered address of the store..."
                className="w-full px-4 py-3 text-base bg-cream shadow-neo-input !border-none rounded-2xl focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all custom-scrollbar"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <Building2 size={16} /> Company Description (Footer)
              </label>
              <textarea
                name="companyDescription"
                value={profile.companyDescription || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Short description about the company for the footer..."
                className="w-full px-4 py-3 text-base bg-cream shadow-neo-input !border-none rounded-2xl focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all custom-scrollbar"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2 flex items-center gap-2">
                <ImageIcon size={16} /> Authorized Signature (For Invoice)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border border-charcoal/10 rounded-2xl p-4">
                {profile.signatureUrl ? (
                  <div className="w-48 h-24 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-2 relative overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                  </div>
                ) : (
                  <div className="w-48 h-24 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon size={24} className="mb-2 opacity-50" />
                    <span className="text-xs">No Signature</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-3">
                    Upload a signature image with a transparent background (PNG) for best results on the invoice.
                  </p>
                  <label className="relative inline-flex items-center justify-center gap-2 px-4 py-2 bg-charcoal text-white text-sm font-bold rounded-full cursor-pointer hover:bg-black hover:shadow-neo-pressed transition-all">
                    {uploadingSignature ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploadingSignature ? "Uploading..." : "Upload Signature"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleSignatureUpload}
                      disabled={uploadingSignature}
                    />
                  </label>
                  {profile.signatureUrl && (
                    <button 
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, signatureUrl: "" }))}
                      className="ml-3 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fees & Taxes Configuration */}
        <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-charcoal/5">
          <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-charcoal/10 pb-2">
            <Building2 className="text-purple-600" size={20} /> Fees & Taxes Configuration
          </h3>
          <p className="text-xs text-slate-500 mb-4">Set the platform fees, shipping costs, and GST percentages based on the standard taxation rules.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2">
                GST Threshold Price (₹)
              </label>
              <input
                type="number"
                name="gstPriceThreshold"
                value={profile.gstPriceThreshold ?? ""}
                onChange={handleChange}
                placeholder="2500"
                step="1"
                min="0"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2">
                Items ≤ ₹{profile.gstPriceThreshold || 2500} (%)
              </label>
              <input
                type="number"
                name="gstPercentBelowThreshold"
                value={profile.gstPercentBelowThreshold ?? ""}
                onChange={handleChange}
                placeholder="5"
                step="0.1"
                min="0"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2">
                Items &gt; ₹{profile.gstPriceThreshold || 2500} (%)
              </label>
              <input
                type="number"
                name="gstPercentAboveThreshold"
                value={profile.gstPercentAboveThreshold ?? ""}
                onChange={handleChange}
                placeholder="18"
                step="0.1"
                min="0"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2">
                Shipping Fee (₹)
              </label>
              <input
                type="number"
                name="shippingFee"
                value={profile.shippingFee ?? ""}
                onChange={handleChange}
                placeholder="79"
                step="1"
                min="0"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2">
                Express Shipping Fee (₹)
              </label>
              <input
                type="number"
                name="expressShippingFee"
                value={profile.expressShippingFee ?? ""}
                onChange={handleChange}
                placeholder="150"
                step="1"
                min="0"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1 md:mb-2">
                Platform Fee (%)
              </label>
              <input
                type="number"
                name="platformFeePercent"
                value={profile.platformFeePercent ?? ""}
                onChange={handleChange}
                placeholder="2"
                step="0.1"
                min="0"
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Company Profile"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
