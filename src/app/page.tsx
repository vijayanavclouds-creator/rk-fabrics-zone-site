import { getHome2HtmlSettings } from "@/actions/system";
import { Home2Client } from "@/components/home2/home2-client";
import { DEFAULT_HERO_HTML, DEFAULT_CAROUSEL_HTML } from "@/app/admin/default-home2-html";
import { PushPrompt } from "@/components/push-prompt";
import prisma from "@/lib/prisma";
import { compileHomeTemplate } from "@/lib/template";
import { maskHtmlContent } from "@/lib/image-mask";

export const revalidate = 3600; // Cache homepage for 1 hour for maximum speed

export default async function Home2() {
  const res = await getHome2HtmlSettings();
  
  // Fetch dynamic products for templating
  const newArrivals = await prisma.product.findMany({
    where: { isNewArrival: true, isActive: true },
    include: { images: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  const topRated = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true },
    take: 10,
    orderBy: { rating: 'desc' }
  });

  const templateData = { newArrivals, topRated };

  // Compile the templates
  const compiledHero = maskHtmlContent(compileHomeTemplate(res.heroHtml || DEFAULT_HERO_HTML, templateData));
  const compiledCarousel = maskHtmlContent(compileHomeTemplate(res.carouselHtml || DEFAULT_CAROUSEL_HTML, templateData));
  
  return (
    <>
      <Home2Client heroHtml={compiledHero} carouselHtml={compiledCarousel} />
      <PushPrompt />
    </>
  );
}
