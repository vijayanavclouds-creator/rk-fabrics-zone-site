import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { PRODUCT_CATEGORIES, FABRIC_OPTIONS } from "@/lib/constants";

// Get Store Taxonomy (Categories and Fabrics)
export async function getStoreTaxonomyData() {
  const fetchTaxonomy = unstable_cache(async () => {
    try {
      const categoriesSetting = await prisma.systemSetting.findUnique({ where: { key: "store_categories" } });
      const fabricsSetting = await prisma.systemSetting.findUnique({ where: { key: "store_fabrics" } });
      
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

// Get Announcement Banner
export async function getAnnouncementBannerData() {
  const fetchBanner = unstable_cache(async () => {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "announcement_banner" }
      });
      if (setting && setting.value) {
        return JSON.parse(setting.value);
      }
      return {
        text: "<strong>FREE SHIPPING</strong> on orders above ₹999 | <span className=\"text-gold-light font-semibold\">FLAT 30% OFF</span> — Use code <span className=\"font-bold bg-white/20 px-1.5 py-0.5 rounded\">RK30</span>",
        isActive: true
      };
    } catch (error) {
      console.error("Error fetching announcement banner:", error);
      return null;
    }
  }, ['announcement_banner'], { tags: ['announcement_banner'], revalidate: 3600 });

  return fetchBanner();
}

// Get Company Profile Settings
export async function getCompanyProfileData() {
  const fetchProfile = unstable_cache(async () => {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "company_profile" }
      });
      
      if (setting) {
        return JSON.parse(setting.value);
      }
      
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
  }, ['company_profile'], { tags: ['company_profile'], revalidate: 3600 });

  return fetchProfile();
}
