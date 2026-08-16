import { NextRequest } from "next/server";
import { CLOUDINARY_BASE } from "@/lib/image-mask";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new Response("Not Found", { status: 404 });
    }

    // Reconstruct the full Cloudinary URL
    const imageUrl = CLOUDINARY_BASE + pathSegments.join("/");

    // Fetch the image from Cloudinary
    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      return new Response("Image not found", { status: imageRes.status });
    }

    // Get the image blob
    const imageBlob = await imageRes.blob();

    // Set aggressive cache headers to ensure this proxy is FAST
    const headers = new Headers();
    headers.set("Content-Type", imageRes.headers.get("content-type") || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(imageBlob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
