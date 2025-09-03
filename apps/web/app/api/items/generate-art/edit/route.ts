import { NextRequest, NextResponse } from "next/server";
import { getItems } from "@/lib/itemsSource";
import { editWithReference } from "@/lib/falEdit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const slug = String(body.slug || "").trim();
  const image_urls = (body.image_urls || []) as string[];
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  if (!image_urls.length) return NextResponse.json({ error: "missing_image_urls" }, { status: 400 });

  const items = await getItems();
  const item = items.find((it) => it.slug === slug);
  if (!item) return NextResponse.json({ error: "item_not_found" }, { status: 404 });

  const prompt = `Transform the reference to a flat, 2D trading card presentation with the following constraints: 
- Maintain exact weapon and skin visual identity
- Neutral matte charcoal background (#0b0d0f)
- 3/4 front-left angle, parallel to ground
- Consistent lighting, soft key and rim
- No text, no watermark on the subject layer
- Output should be suitable for compositing under a branded card frame
Context: ${item.weapon} | ${item.skin_family}, ${item.condition}, float ${Number(item.float).toFixed(4)}.`;

  try {
    const url = await editWithReference(prompt, image_urls);
    return NextResponse.json({ slug, url });
  } catch (e: any) {
    return NextResponse.json({ error: "edit_failed", message: e?.message || String(e) }, { status: 502 });
  }
}
