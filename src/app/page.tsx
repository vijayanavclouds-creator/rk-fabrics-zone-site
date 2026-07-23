import { getBannersData } from "@/lib/data/banners";
import { HomeClient } from "@/components/home/home-client";

export const revalidate = 3600; // Revalidate every hour if not using tags

export default async function Home() {
  const res = await getBannersData();
  const heroBanners = res.success && res.banners ? res.banners.filter((b: any) => b.type === "hero") : [];
  const carouselBanners = res.success && res.banners ? res.banners.filter((b: any) => b.type === "carousel") : [];

  return <HomeClient heroBanners={heroBanners} carouselBanners={carouselBanners} />;
}
