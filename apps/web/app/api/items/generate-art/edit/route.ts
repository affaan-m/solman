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

  const prompt = `Replicate the exact 2D card layout, gradients, borders, and framing of the first reference image.
Use the second image only as the subject (weapon skin) to be placed into the card in the same position/scale.
Overlay metadata text layers with the following values from the sheet data:
- Name: ${item.name}
- Rarity: ${item.rarity}
- Condition: ${item.condition}
- Float: ${Number(item.float).toFixed(4)}
${item.pattern_seed ? `- Pattern: ${item.pattern_seed}` : ''}
${item.stattrak ? `- StatTrak: yes` : '- StatTrak: no'}
${item.stickers ? `- Stickers: ${item.stickers}` : ''}
Ensure a clean, flat 2D look; no additional watermarks; maintain color accuracy.`;

  try {
    const url = await editWithReference(prompt, image_urls);
    return NextResponse.json({ slug, url });
  } catch (e: any) {
    return NextResponse.json({ error: "edit_failed", message: e?.message || String(e) }, { status: 502 });
  }
}
