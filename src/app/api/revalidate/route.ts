import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "purge123") {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag("navigation_links");
  revalidateTag("announcement_banner");
  revalidateTag("store_taxonomy");
  revalidateTag("company_profile");
  revalidateTag("banners_cache");
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
