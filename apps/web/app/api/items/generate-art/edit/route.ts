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

  // Map rarity to a concrete gradient to reduce ambiguity
  const rarityToGradient: Record<string, { from: string; to: string }> = {
    consumer: { from: "#FFFFFF", to: "#E6E6E6" },
    industrial: { from: "#8DD0FF", to: "#4BA3FF" },
    mil_spec: { from: "#3B82F6", to: "#1D4ED8" },
    restricted: { from: "#A855F7", to: "#7C3AED" },
    classified: { from: "#EC4899", to: "#BE185D" },
    covert: { from: "#EF4444", to: "#991B1B" },
    legendary: { from: "#FFD700", to: "#8A6D1A" }
  };
  const grad = rarityToGradient[(item.rarity as any) || "mil_spec"] || rarityToGradient.mil_spec;

  let prompt: string;
  if ((image_urls?.length || 0) <= 1) {
    // Single reference: treat it as the template; do NOT insert subject image.
    prompt = `Use the single reference image strictly as a template for a flat, 2D trading card.
Replace all text in the template with these exact values:
- Name: ${item.name}
- Weapon: ${item.weapon}
- Rarity: ${item.rarity}
- Condition: ${item.condition}
- Float: ${Number(item.float).toFixed(4)}
${item.pattern_seed ? `- Pattern: ${item.pattern_seed}` : ""}
${item.stattrak ? `- StatTrak: yes` : "- StatTrak: no"}
${item.stickers ? `- Stickers: ${item.stickers}` : ""}
Keep layout, fonts, spacing, borders, and effects identical to the template.
Set the card's background gradient to ${grad.from} -> ${grad.to} based on rarity.
Do not place any weapon or subject image; leave the central area abstract per the template style.
Output should be a clean card suitable for pack-opening UI.`;
  } else {
    // Two-image flow: first is template, second is subject (legacy path)
    prompt = `Replicate the exact 2D card layout, gradients, borders, and framing of the first reference image.
Use the second image only as the subject (weapon skin) to be placed into the card in the same position/scale.
Overlay metadata text layers with the following values from the sheet data:
- Name: ${item.name}
- Rarity: ${item.rarity}
- Condition: ${item.condition}
- Float: ${Number(item.float).toFixed(4)}
${item.pattern_seed ? `- Pattern: ${item.pattern_seed}` : ""}
${item.stattrak ? `- StatTrak: yes` : "- StatTrak: no"}
${item.stickers ? `- Stickers: ${item.stickers}` : ""}
Ensure a clean, flat 2D look; no additional watermarks; maintain color accuracy.`;
  }

  try {
    const url = await editWithReference(prompt, image_urls);
    return NextResponse.json({ slug, url });
  } catch (e: any) {
    return NextResponse.json({ error: "edit_failed", message: e?.message || String(e) }, { status: 502 });
  }
}
