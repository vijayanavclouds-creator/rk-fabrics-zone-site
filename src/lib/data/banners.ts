import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export async function getBannersData() {
  const fetchBanners = unstable_cache(async () => {
    try {
      const banners = await prisma.banner.findMany({
        orderBy: { order: 'asc' }
      })
      return { success: true, banners }
    } catch (error: any) {
      console.error("Error fetching banners:", error)
      return { success: false, error: error.message }
    }
  }, ['banners_cache'], { tags: ['banners_cache'], revalidate: 3600 });
  
  return fetchBanners();
}
