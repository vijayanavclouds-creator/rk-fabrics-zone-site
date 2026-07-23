import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { PRODUCT_CATEGORIES, FABRIC_OPTIONS } from "@/lib/constants";

// Get Store Taxonomy (Categories and Fabrics)
export async function getStoreTaxonomyData() {
  const fetchTaxonomy = unstable_cache(async () => {
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
  }, ['store_taxonomy'], { tags: ['store_taxonomy'], revalidate: 3600 });
  
  return fetchTaxonomy();
}

// Get Navigation Links
export async function getNavigationLinksData() {
  const fetchLinks = unstable_cache(async () => {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "navigation_links" }
      });
      
      let links = null;
      if (setting) {
        links = JSON.parse(setting.value);
      }

      // Dynamically inject fabrics into the navigation links
      const { fabrics } = await getStoreTaxonomyData();
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
  }, ['navigation_links'], { tags: ['navigation_links'], revalidate: 3600 });
  
  return fetchLinks();
}
