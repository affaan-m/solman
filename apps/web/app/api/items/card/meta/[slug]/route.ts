import { ImageResponse, NextRequest } from "next/server";
import { getItems } from "@/lib/itemsSource";

export const runtime = "edge";

// CS2 rarity palette (approx.)
const rarityPalette: Record<string, { from: string; to: string; stripe?: string }> = {
  consumer: { from: "#FFFFFF", to: "#E6E6E6", stripe: "#CCCCCC" }, // white
  industrial: { from: "#8DD0FF", to: "#4BA3FF", stripe: "#6BB8FF" }, // light blue
  mil_spec: { from: "#3B82F6", to: "#1D4ED8", stripe: "#60A5FA" }, // blue
  restricted: { from: "#A855F7", to: "#7C3AED", stripe: "#C084FC" }, // purple
  classified: { from: "#EC4899", to: "#BE185D", stripe: "#F472B6" }, // pink
  covert: { from: "#EF4444", to: "#991B1B", stripe: "#F87171" }, // red
  legendary: { from: "#FFD700", to: "#8A6D1A", stripe: "#F6E27A" }, // gold (extraordinary)
};

function mapRarityToTier(rarity: string): keyof typeof rarityPalette {
  const r = (rarity || "").toLowerCase();
  if (r.includes("consumer")) return "consumer";
  if (r.includes("industrial")) return "industrial";
  if (r.includes("mil")) return "mil_spec";
  if (r.includes("restricted")) return "restricted";
  if (r.includes("classified")) return "classified";
  if (r.includes("covert")) return "covert";
  return "legendary"; // extraordinary / legendary
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const items = await getItems();
  const item = items.find((it) => it.slug === slug);
  if (!item) return new Response("not_found", { status: 404 });

  const tier = mapRarityToTier(item.rarity as any);
  const { from, to, stripe } = rarityPalette[tier] ?? rarityPalette.mil_spec;

  const width = 1200;
  const height = 700;
  const pad = 24;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const bgStyle = {
    width: `${width}px`,
    height: `${height}px`,
    display: "flex",
    background: `linear-gradient(135deg, ${from}, ${to})`,
    padding: `${pad}px`,
    boxSizing: "border-box",
    fontFamily: "Inter, ui-sans-serif, system-ui",
  } as const;

  const subtleStripe = stripe
    ? {
        backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 6px, transparent 6px 14px)`,
      }
    : {};

  return new ImageResponse(
    (
      <div style={bgStyle}>
        <div
          style={{
            position: "relative",
            width: `${innerW}px`,
            height: `${innerH}px`,
            borderRadius: 20,
            display: "flex",
            background: "#0b0d0f",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Rarity background motif (no skin image) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(120% 120% at 50% 40%, rgba(255,255,255,0.05), rgba(0,0,0,0))`,
              ...subtleStripe,
            }}
          />

          {/* Header with logo and rarity pill */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 120,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${from}, ${to})`,
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              />
              <div style={{ color: "#E5E7EB", fontSize: 24, fontWeight: 800 }}>Solman.gg</div>
            </div>
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 20,
                fontWeight: 700,
                color: "#0b0d0f",
                background: `linear-gradient(135deg, ${from}, ${to})`,
                border: "1px solid rgba(255,255,255,0.25)",
                textTransform: "capitalize",
              }}
            >
              {String(item.rarity).replace(/_/g, " ")}
            </div>
          </div>

          {/* Footer info panel (no skin image) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 230,
              background: "linear-gradient(to top, rgba(0,0,0,0.68), rgba(0,0,0,0))",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <div style={{ padding: 24, width: "100%", display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", maxWidth: innerW - 360 }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>{item.name}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontSize: 20, color: "#D0D4DA" }}>{item.weapon}</div>
                  <div style={{ fontSize: 20, color: "#D0D4DA" }}>{item.condition}</div>
                  <div style={{ fontSize: 20, color: "#D0D4DA" }}>float {Number(item.float ?? 0).toFixed(4)}</div>
                  {item.pattern_seed ? (
                    <div style={{ fontSize: 20, color: "#D0D4DA" }}>pattern {item.pattern_seed}</div>
                  ) : null}
                  {item.stattrak ? (
                    <div style={{ fontSize: 18, color: "#F39C12", fontWeight: 700 }}>StatTrak</div>
                  ) : null}
                </div>
                {item.stickers ? (
                  <div style={{ marginTop: 6, fontSize: 18, color: "#C2C7CF", opacity: 0.95 }}>Stickers: {item.stickers}</div>
                ) : null}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 300 }}>
                <div style={{ fontSize: 18, color: "#AEB6C2" }}>Estimated Value</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF" }}>
                  ${((item as any).est_value_cents ? (item as any).est_value_cents / 100 : 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width, height, headers: { "Content-Type": "image/png" } }
  );
}
