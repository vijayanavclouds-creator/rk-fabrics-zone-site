import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "purge123") {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("navigation_links", "max");
  revalidateTag("announcement_banner", "max");
  revalidateTag("store_taxonomy", "max");
  revalidateTag("company_profile", "max");
  revalidateTag("banners_cache", "max");
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
