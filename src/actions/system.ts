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
    
    findChanges(oldLinks || [], links);
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
    threshold: profile?.gstPriceThreshold ?? 2500,
    belowThreshold: profile?.gstPercentBelowThreshold ?? 5,
    aboveThreshold: profile?.gstPercentAboveThreshold ?? 18,
    shippingFee: profile?.shippingFee ?? 79,
    expressShippingFee: profile?.expressShippingFee ?? 150,
    platformFeePercent: profile?.platformFeePercent ?? 2
  };
}

// Get Home2 HTML Settings
export async function getHome2HtmlSettings() {
  try {
    const heroRecord = await prisma.systemSetting.findUnique({ where: { key: "HOME2_HERO_HTML" } });
    const carouselRecord = await prisma.systemSetting.findUnique({ where: { key: "HOME2_CAROUSEL_HTML" } });
    return {
      success: true,
      heroHtml: heroRecord ? heroRecord.value : "",
      carouselHtml: carouselRecord ? carouselRecord.value : ""
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Save Home2 HTML Settings
export async function saveHome2HtmlSettings(heroHtml: string, carouselHtml: string) {
  try {
    await prisma.systemSetting.upsert({
      where: { key: "HOME2_HERO_HTML" },
      update: { value: heroHtml },
      create: { key: "HOME2_HERO_HTML", value: heroHtml }
    });
    await prisma.systemSetting.upsert({
      where: { key: "HOME2_CAROUSEL_HTML" },
      update: { value: carouselHtml },
      create: { key: "HOME2_CAROUSEL_HTML", value: carouselHtml }
    });
    
    revalidatePath("/");
    revalidatePath("/admin");
    
    // Log the action
    await logAdminActivity("updated homepage HTML settings", "Modified dynamic homepage HTML");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error saving Home2 HTML settings:", error);
    return { success: false, error: error.message };
  }
}

// Get HTML Records
export async function getHtmlRecords() {
  try {
    const records = await prisma.htmlRecord.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return { success: true, records };
  } catch (error: any) {
    console.error("Error fetching HTML records:", error);
    return { success: false, error: error.message };
  }
}

// Create HTML Record
export async function createHtmlRecord(title: string, type: string, code: string) {
  try {
    await prisma.htmlRecord.create({
      data: {
        title,
        type,
        code
      }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating HTML record:", error);
    return { success: false, error: error.message };
  }
}

// Update HTML Record
export async function updateHtmlRecord(id: string, title: string, type: string, code: string) {
  try {
    await prisma.htmlRecord.update({
      where: { id },
      data: {
        title,
        type,
        code
      }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating HTML record:", error);
    return { success: false, error: error.message };
  }
}

// Delete HTML Record
export async function deleteHtmlRecord(id: string) {
  try {
    await prisma.htmlRecord.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting HTML record:", error);
    return { success: false, error: error.message };
  }
}
