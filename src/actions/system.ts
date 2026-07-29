"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { logAdminActivity } from "./admin-activity";
import { generateDiffString } from "@/lib/utils";
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
    const oldBanner = await getAnnouncementBannerData();
    
    await prisma.systemSetting.upsert({
      where: { key: "announcement_banner" },
      update: { value: JSON.stringify(data) },
      create: { key: "announcement_banner", value: JSON.stringify(data) }
    });
    revalidateTag("announcement_banner");
    revalidatePath("/", "layout");
    
    const diff = generateDiffString(oldBanner || {}, data);
    if (diff) {
      await logAdminActivity("updated announcement banner", diff);
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Save Navigation Links
export async function saveNavigationLinks(links: any) {
  try {
    const oldLinks = await getNavigationLinksData();
    
    await prisma.systemSetting.upsert({
      where: { key: "navigation_links" },
      update: { value: JSON.stringify(links) },
      create: { key: "navigation_links", value: JSON.stringify(links) }
    });
    
    // Revalidate the entire app so the header updates instantly everywhere
    revalidateTag("navigation_links");
    revalidatePath("/", "layout");
    
    const changes: string[] = [];
    
    const findChanges = (oldArr: any[], newArr: any[], prefix = "link") => {
      // Find deleted
      oldArr.forEach(oldItem => {
        const found = newArr.find(newItem => (oldItem.href && newItem.href === oldItem.href) || newItem.label === oldItem.label);
        if (!found) {
          changes.push(`deleted ${prefix} <i>${oldItem.label}</i>`);
        }
      });
      
      // Find added and renamed
      newArr.forEach(newItem => {
        // Try match by href first (if exists)
        let oldMatch = newItem.href ? oldArr.find(oldItem => oldItem.href === newItem.href) : null;
        if (!oldMatch) {
          // Try match by label
          oldMatch = oldArr.find(oldItem => oldItem.label === newItem.label);
        }
        
        if (!oldMatch) {
          changes.push(`added ${prefix} <i>${newItem.label}</i>`);
        } else {
          // Matched! Did label change?
          if (oldMatch.label !== newItem.label) {
            changes.push(`renamed ${prefix} <i>${oldMatch.label}</i> to <i>${newItem.label}</i>`);
          }
          // Check submenus
          if (oldMatch.submenu || newItem.submenu) {
             const oldSub = oldMatch.submenu || [];
             const newSub = newItem.submenu || [];
             findChanges(oldSub, newSub, `submenu under <b>${newItem.label}</b>`);
          }
        }
      });
    };
    
    findChanges(oldLinks, links);
    const diff = changes.length > 0 ? changes.join(", ") : "reordered links";
    
    await logAdminActivity("updated navigation links", diff);
    
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
    const oldTaxonomy = await getStoreTaxonomyData();
    
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
    revalidateTag("store_taxonomy");
    revalidateTag("navigation_links");
    revalidatePath("/shop");
    revalidatePath("/admin");
    
    const changes: string[] = [];
    
    const diffTaxonomy = (oldArr: any[], newArr: any[], prefix: string) => {
      oldArr.forEach(oldItem => {
        if (!newArr.find(newItem => (oldItem.value && newItem.value === oldItem.value) || newItem.label === oldItem.label)) {
          changes.push(`deleted ${prefix} <i>${oldItem.label}</i>`);
        }
      });
      newArr.forEach(newItem => {
        let oldMatch = newItem.value ? oldArr.find(oldItem => oldItem.value === newItem.value) : null;
        if (!oldMatch) oldMatch = oldArr.find(oldItem => oldItem.label === newItem.label);
        
        if (!oldMatch) {
          changes.push(`added ${prefix} <i>${newItem.label}</i>`);
        } else if (oldMatch.label !== newItem.label) {
          changes.push(`renamed ${prefix} <i>${oldMatch.label}</i> to <i>${newItem.label}</i>`);
        }
      });
    };
    
    diffTaxonomy(oldTaxonomy.categories, categories, "category");
    diffTaxonomy(oldTaxonomy.fabrics, fabrics, "fabric");
    
    const diff = changes.length > 0 ? changes.join(", ") : "reordered taxonomy";
    
    await logAdminActivity("updated store taxonomy", diff);
    
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
    const oldProfile = await getCompanyProfileData();
    
    await prisma.systemSetting.upsert({
      where: { key: "company_profile" },
      update: { value: JSON.stringify(profileData) },
      create: { key: "company_profile", value: JSON.stringify(profileData) }
    });
    
    revalidateTag("company_profile");
    revalidatePath("/", "layout"); // Revalidate all pages in case footer/header uses this
    
    const diff = generateDiffString(oldProfile || {}, profileData);
    if (diff) {
      await logAdminActivity("updated company profile settings", diff);
    }
    
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
