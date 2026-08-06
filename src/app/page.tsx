import { getHome2HtmlSettings } from "@/actions/system";
import { Home2Client } from "@/components/home2/home2-client";
import { DEFAULT_HERO_HTML, DEFAULT_CAROUSEL_HTML } from "@/app/admin/default-home2-html";

export const revalidate = 0; // Always fetch fresh HTML for testing

export default async function Home2() {
  const res = await getHome2HtmlSettings();
  
  return <Home2Client heroHtml={res.heroHtml || DEFAULT_HERO_HTML} carouselHtml={res.carouselHtml || DEFAULT_CAROUSEL_HTML} />;
}
