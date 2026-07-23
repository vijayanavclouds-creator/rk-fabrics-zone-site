"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PRODUCT_CATEGORIES, FABRIC_OPTIONS } from "@/lib/constants";
import { getNavigationLinksData, getStoreTaxonomyData } from "@/lib/data/system";

// Get Navigation Links
export async function getNavigationLinks() {
  return getNavigationLinksData();
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
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "company_profile" }
    });
    
    if (setting) {
      return JSON.parse(setting.value);
    }
    
    // Default empty profile
    return {
      instagramUrl: "",
      facebookUrl: "",
      contactNumber: "",
      helpCenterNumber: "",
      supportEmail: "",
      ownerName: "",
      websiteUrl: "",
      address: "",
      companyDescription: "",
      gstNumber: ""
    };
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return null;
  }
}

// Save Company Profile Settings
export async function saveCompanyProfile(profileData: any) {
  try {
    await prisma.systemSetting.upsert({
      where: { key: "company_profile" },
      update: { value: JSON.stringify(profileData) },
      create: { key: "company_profile", value: JSON.stringify(profileData) }
    });
    
    revalidatePath("/", "layout"); // Revalidate all pages in case footer/header uses this
    return { success: true };
  } catch (error: any) {
    console.error("Error saving company profile:", error);
    return { success: false, error: error.message };
  }
}
