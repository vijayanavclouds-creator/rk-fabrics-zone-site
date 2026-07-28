"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { PRODUCT_CATEGORIES, FABRIC_OPTIONS } from "@/lib/constants";
import { getNavigationLinksData, getStoreTaxonomyData, getAnnouncementBannerData, getCompanyProfileData } from "@/lib/data/system";

// Get Navigation Links
export async function getNavigationLinks() {
  return getNavigationLinksData();
}

// Get Announcement Banner
export async function getAnnouncementBanner() {
  return getAnnouncementBannerData();
}

// Save Announcement Banner
export async function saveAnnouncementBanner(data: { text: string; isActive: boolean }) {
  try {
    await prisma.systemSetting.upsert({
      where: { key: "announcement_banner" },
      update: { value: JSON.stringify(data) },
      create: { key: "announcement_banner", value: JSON.stringify(data) }
    });
    revalidateTag("announcement_banner", "max");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Save Navigation Links
export async function saveNavigationLinks(links: any) {
  try {
    await prisma.systemSetting.upsert({
      where: { key: "navigation_links" },
      update: { value: JSON.stringify(links) },
      create: { key: "navigation_links", value: JSON.stringify(links) }
    });
    
    // Revalidate the entire app so the header updates instantly everywhere
    revalidateTag("navigation_links", "max");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error saving navigation links:", error);
    return { success: false, error: error.message };
  }
}

// Get Store Taxonomy (Categories and Fabrics)
export async function getStoreTaxonomy() {
  return getStoreTaxonomyData();
}

// Save Store Taxonomy
export async function saveStoreTaxonomy(categories: any[], fabrics: any[]) {
  try {
    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: "store_categories" },
        update: { value: JSON.stringify(categories) },
        create: { key: "store_categories", value: JSON.stringify(categories) }
      }),
      prisma.systemSetting.upsert({
        where: { key: "store_fabrics" },
        update: { value: JSON.stringify(fabrics) },
        create: { key: "store_fabrics", value: JSON.stringify(fabrics) }
      })
    ]);
    
    // Revalidate paths that use these filters
    revalidateTag("store_taxonomy", "max");
    revalidateTag("navigation_links", "max");
    revalidatePath("/shop");
    revalidatePath("/admin");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error saving store taxonomy:", error);
    return { success: false, error: error.message };
  }
}

// Get Company Profile Settings
export async function getCompanyProfile() {
  return getCompanyProfileData();
}

// Save Company Profile Settings
export async function saveCompanyProfile(profileData: any) {
  try {
    await prisma.systemSetting.upsert({
      where: { key: "company_profile" },
      update: { value: JSON.stringify(profileData) },
      create: { key: "company_profile", value: JSON.stringify(profileData) }
    });
    
    revalidateTag("company_profile", "max");
    revalidatePath("/", "layout"); // Revalidate all pages in case footer/header uses this
    return { success: true };
  } catch (error: any) {
    console.error("Error saving company profile:", error);
    return { success: false, error: error.message };
  }
}

// Get GST Rates
export async function getGSTRates() {
  const profile = await getCompanyProfileData();
  return {
    below1000: profile?.gstPercentBelow1000 ?? 5,
    above1000: profile?.gstPercentAbove1000 ?? 12,
    shippingFee: profile?.shippingFee ?? 79,
    platformFeePercent: profile?.platformFeePercent ?? 2
  };
}
