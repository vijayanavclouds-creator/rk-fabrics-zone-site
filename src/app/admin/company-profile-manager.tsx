"use client";

import { useState, useEffect } from "react";
import { getCompanyProfile, saveCompanyProfile } from "@/actions/system";
import { toast } from "sonner";
import { Save, Link as LinkIcon, Phone, Mail, User, Globe, MapPin, Building2 } from "lucide-react";

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
    gstNumber: ""
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      <div className="bg-white p-6 rounded-3xl border border-charcoal/10 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Social Media & Links */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-charcoal/5">
          <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-charcoal/10 pb-2">
            <Globe className="text-blue-500" size={20} /> Social & Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <LinkIcon size={16} /> Instagram URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={profile.instagramUrl || ""}
                onChange={handleChange}
                placeholder="https://instagram.com/yourstore"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <LinkIcon size={16} /> Facebook URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={profile.facebookUrl || ""}
                onChange={handleChange}
                placeholder="https://facebook.com/yourstore"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <LinkIcon size={16} /> X (Twitter) URL
              </label>
              <input
                type="url"
                name="xUrl"
                value={profile.xUrl || ""}
                onChange={handleChange}
                placeholder="https://x.com/yourstore"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <LinkIcon size={16} /> Threads URL
              </label>
              <input
                type="url"
                name="threadsUrl"
                value={profile.threadsUrl || ""}
                onChange={handleChange}
                placeholder="https://threads.net/@yourstore"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <LinkIcon size={16} /> Pinterest URL
              </label>
              <input
                type="url"
                name="pinterestUrl"
                value={profile.pinterestUrl || ""}
                onChange={handleChange}
                placeholder="https://pinterest.com/yourstore"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <LinkIcon size={16} /> LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={profile.linkedinUrl || ""}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/yourstore"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <LinkIcon size={16} /> WhatsApp URL
              </label>
              <input
                type="url"
                name="whatsappUrl"
                value={profile.whatsappUrl || ""}
                onChange={handleChange}
                placeholder="https://wa.me/1234567890"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <Globe size={16} /> Website URL (Main/Blog)
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={profile.websiteUrl || ""}
                onChange={handleChange}
                placeholder="https://rkfabricszone.com"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-charcoal/5">
          <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-charcoal/10 pb-2">
            <Phone className="text-emerald-600" size={20} /> Contact & Support
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <Phone size={16} /> Contact Number
              </label>
              <input
                type="text"
                name="contactNumber"
                value={profile.contactNumber}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <Phone size={16} /> Help Center Number
              </label>
              <input
                type="text"
                name="helpCenterNumber"
                value={profile.helpCenterNumber}
                onChange={handleChange}
                placeholder="1800-123-4567"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <Mail size={16} /> Support Email
              </label>
              <input
                type="email"
                name="supportEmail"
                value={profile.supportEmail}
                onChange={handleChange}
                placeholder="support@rkfabricszone.com"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <User size={16} /> Owner / Entity Name
              </label>
              <input
                type="text"
                name="ownerName"
                value={profile.ownerName}
                onChange={handleChange}
                placeholder="RK Fabrics Zone Pvt Ltd"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <Building2 size={16} /> GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                value={profile.gstNumber}
                onChange={handleChange}
                placeholder="08XXXXX1234X1ZX"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <MapPin size={16} /> Registered Address
              </label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                rows={3}
                placeholder="Full registered address of the store..."
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all custom-scrollbar"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                <Building2 size={16} /> Company Description (Footer)
              </label>
              <textarea
                name="companyDescription"
                value={profile.companyDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Short description about the company for the footer..."
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all custom-scrollbar"
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
