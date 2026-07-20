"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PRODUCT_CATEGORIES, FABRIC_OPTIONS } from "@/lib/constants";

// Get Navigation Links
export async function getNavigationLinks() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "navigation_links" }
    });
    
    let links = null;
    if (setting) {
      links = JSON.parse(setting.value);
    }

    // Dynamically inject fabrics into the navigation links
    const { fabrics } = await getStoreTaxonomy();
    if (links) {
      const fabricsLink = links.find((l: any) => l.label === "Fabrics");
      if (fabricsLink) {
        fabricsLink.submenu = fabrics.map((f: any) => ({
          label: f.label,
          href: `/shop?fabric=${f.value}`
        }));
      }
    }
    
    return links;
  } catch (error) {
    console.error("Error fetching navigation links:", error);
    return null;
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
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error saving navigation links:", error);
    return { success: false, error: error.message };
  }
}

// Get Store Taxonomy (Categories and Fabrics)
export async function getStoreTaxonomy() {
  try {
    const [categoriesSetting, fabricsSetting] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: "store_categories" } }),
      prisma.systemSetting.findUnique({ where: { key: "store_fabrics" } })
    ]);
    
    return {
      categories: categoriesSetting ? JSON.parse(categoriesSetting.value) : PRODUCT_CATEGORIES,
      fabrics: fabricsSetting ? JSON.parse(fabricsSetting.value) : FABRIC_OPTIONS
    };
  } catch (error) {
    console.error("Error fetching store taxonomy:", error);
    return {
      categories: PRODUCT_CATEGORIES,
      fabrics: FABRIC_OPTIONS
    };
  }
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
