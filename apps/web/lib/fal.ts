import type { ItemRecord } from "@/lib/itemsSource";

const FAL_ENDPOINT = "https://fal.run/fal-ai/nano-banana";

export type FalGenerateResponse = {
  images: { url: string }[];
  description?: string;
};

function wearAbbrevFromCondition(condition: string): string {
  const c = (condition || "").toLowerCase();
  if (c.includes("factory new")) return "FN";
  if (c.includes("minimal wear")) return "MW";
  if (c.includes("field-tested")) return "FT";
  if (c.includes("well-worn")) return "WW";
  if (c.includes("battle-scarred")) return "BS";
  return condition || "";
}

function buildSkinPrompt(item: ItemRecord): string {
  // Consistent catalog-style template
  const wearAbbrev = wearAbbrevFromCondition(item.condition);
  const parts = [
    "Ultra-clean studio product render of a Counter-Strike weapon skin.",
    "Single weapon, centered, 3/4 front-left angle, parallel to ground,",
    "matte charcoal background (#0b0d0f), soft key + rim lighting,",
    "subtle ground contact shadow, no text, no watermark, film grain off,",
    "sharp details, photorealistic, high dynamic range, consistent catalog style.",
    "\nSubject details:",
    `Weapon: ${item.weapon}`,
    `Skin: ${item.skin_family}`,
    `Wear: ${item.condition} (${wearAbbrev})`,
    `Float: ${Number(item.float).toFixed(4)}`,
    item.pattern_seed ? `Pattern Seed: ${item.pattern_seed}` : "Pattern Seed: none",
    item.stattrak ? "StatTrak: yes" : "StatTrak: no",
    item.stickers ? `Stickers: ${item.stickers}` : "Stickers: none",
    "\nFraming: 16:9, subject fills 70% width, ample negative space, no cropping.",
    "Color accuracy and material fidelity prioritized."
  ];
  return parts.join(" ");
}

export async function generateSkinImage(item: ItemRecord): Promise<string> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("Missing FAL_KEY env var");

  const prompt = buildSkinPrompt(item);

  const res = await fetch(FAL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      num_images: 1,
      output_format: "jpeg",
      sync_mode: false
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`FAL request failed: ${res.status} ${res.statusText} ${text}`);
  }

  const data = (await res.json()) as FalGenerateResponse;
  const url = data.images?.[0]?.url;
  if (!url) throw new Error("FAL response missing image url");
  return url;
}
