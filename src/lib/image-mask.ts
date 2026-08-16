export const CLOUDINARY_BASE = "https://res.cloudinary.com/";

/**
 * Masks a Cloudinary URL by replacing the base domain with our secure local API proxy.
 * If the URL is not a Cloudinary URL, it returns it unchanged.
 */
export function maskImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith(CLOUDINARY_BASE)) {
    return url.replace(CLOUDINARY_BASE, "/api/media/");
  }
  return url;
}

/**
 * Replaces all Cloudinary URLs inside an HTML string or text payload.
 */
export function maskHtmlContent(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/https:\/\/res\.cloudinary\.com\//g, "/api/media/");
}
