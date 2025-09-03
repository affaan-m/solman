import { NextRequest, NextResponse } from "next/server";
import { getItems } from "@/lib/itemsSource";
import { generateSkinImage } from "@/lib/fal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const slug = String(body.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });

  const items = await getItems();
  const item = items.find((it) => it.slug === slug);
  if (!item) return NextResponse.json({ error: "item_not_found" }, { status: 404 });

  try {
    const url = await generateSkinImage(item as any);
    return NextResponse.json({ slug, url });
  } catch (e: any) {
    return NextResponse.json({ error: "generation_failed", message: e?.message || String(e) }, { status: 502 });
  }
}
