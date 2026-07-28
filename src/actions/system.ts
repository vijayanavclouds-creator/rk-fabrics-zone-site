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
    revalidateTag("announcement_banner", "max");
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
    revalidateTag("navigation_links", "max");
    revalidatePath("/", "layout");
    
    const changes: string[] = [];
    if (oldLinks.length !== links.length) {
      changes.push(`changed link count from ${oldLinks.length} to ${links.length}`);
    } else {
      for (let i = 0; i < oldLinks.length; i++) {
        if (oldLinks[i].label !== links[i].label) {
          changes.push(`renamed <i>${oldLinks[i].label}</i> to <i>${links[i].label}</i>`);
        }
        if (oldLinks[i].submenu && links[i].submenu) {
          if (oldLinks[i].submenu.length !== links[i].submenu.length) {
            changes.push(`changed submenus under <b>${links[i].label}</b> from ${oldLinks[i].submenu.length} to ${links[i].submenu.length}`);
          } else {
            for (let j = 0; j < oldLinks[i].submenu.length; j++) {
              if (oldLinks[i].submenu[j].label !== links[i].submenu[j].label) {
                changes.push(`renamed submenu <i>${oldLinks[i].submenu[j].label}</i> to <i>${links[i].submenu[j].label}</i> under <b>${links[i].label}</b>`);
              }
            }
          }
        }
      }
    }
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
    revalidateTag("store_taxonomy", "max");
    revalidateTag("navigation_links", "max");
    revalidatePath("/shop");
    revalidatePath("/admin");
    
    const changes: string[] = [];
    if (oldTaxonomy.categories.length !== categories.length) {
      changes.push(`categories count: ${oldTaxonomy.categories.length} -> ${categories.length}`);
    } else {
      for (let i = 0; i < oldTaxonomy.categories.length; i++) {
        if (oldTaxonomy.categories[i].label !== categories[i].label) {
          changes.push(`renamed category <i>${oldTaxonomy.categories[i].label}</i> to <i>${categories[i].label}</i>`);
        }
      }
    }
    
    if (oldTaxonomy.fabrics.length !== fabrics.length) {
      changes.push(`fabrics count: ${oldTaxonomy.fabrics.length} -> ${fabrics.length}`);
    } else {
      for (let i = 0; i < oldTaxonomy.fabrics.length; i++) {
        if (oldTaxonomy.fabrics[i].label !== fabrics[i].label) {
          changes.push(`renamed fabric <i>${oldTaxonomy.fabrics[i].label}</i> to <i>${fabrics[i].label}</i>`);
        }
      }
    }
    
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
    
    revalidateTag("company_profile", "max");
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
