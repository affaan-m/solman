import { ImageResponse, NextRequest } from "next/server";

export const runtime = "edge";

function rarityColors(rarity: string) {
  switch (rarity) {
    case "legendary":
      return { from: "#FFD700", to: "#8A6D1A" };
    case "covert":
      return { from: "#E74C3C", to: "#8E2A22" };
    case "classified":
      return { from: "#9B59B6", to: "#5E3370" };
    case "restricted":
      return { from: "#4C6FFF", to: "#2B3D99" };
    default:
      return { from: "#B0B0B0", to: "#6E6E6E" };
  }
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  const origin = req.nextUrl.origin;
  const itemsRes = await fetch(`${origin}/api/items`, { cache: "no-store" });
  const items = (await itemsRes.json()) as any[];
  const item = items.find((it) => it.slug === slug);
  if (!item) {
    return new Response("not_found", { status: 404 });
  }

  const providedImage = req.nextUrl.searchParams.get("image") || "";
  const localEdited = `${origin}/cards_edit/${encodeURIComponent(slug)}.jpg`;
  const localGenerated = `${origin}/generated/${encodeURIComponent(slug)}.jpg`;
  const fallbackArt = (item as any).art_url as string | undefined;
  const imageUrl = providedImage || localEdited || localGenerated || fallbackArt || "";

  const { from, to } = rarityColors((item as any).rarity as string);

  const width = 1200;
  const height = 700;
  const pad = 24;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          background: `linear-gradient(135deg, ${from}, ${to})`,
          padding: `${pad}px`,
          boxSizing: "border-box",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        }}
      >
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
          {/* Skin image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={(item as any).name}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.96 }}
            />
          ) : null}

          {/* Subtle vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(120% 120% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)",
            }}
          />

          {/* Header bar with logo */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 130,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
            }}
          >
            <img
              src={`${origin}/branding/solman.gg.logo.faceonly.jpg`}
              width={96}
              height={96}
              style={{ borderRadius: 12, objectFit: "cover" }}
            />
            <div
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 700,
                color: "#0b0d0f",
                background: `linear-gradient(135deg, ${from}, ${to})`,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {(item as any).rarity as string}
            </div>
          </div>

          {/* Bottom info bar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 220,
              background: "linear-gradient(to top, rgba(0,0,0,0.68), rgba(0,0,0,0))",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <div style={{ padding: 24, width: "100%", display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", maxWidth: innerW - 340 }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>{(item as any).name}</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0b0d0f",
                      background: `linear-gradient(135deg, ${from}, ${to})`,
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    {(item as any).rarity as string}
                  </div>
                  <div style={{ fontSize: 20, color: "#D0D4DA" }}>{(item as any).condition as string}</div>
                  <div style={{ fontSize: 20, color: "#D0D4DA" }}>float {Number((item as any).float).toFixed(4)}</div>
                  {(item as any).pattern_seed ? (
                    <div style={{ fontSize: 20, color: "#D0D4DA" }}>pattern {(item as any).pattern_seed}</div>
                  ) : null}
                  {(item as any).stattrak ? (
                    <div style={{ fontSize: 18, color: "#F39C12", fontWeight: 700 }}>StatTrak</div>
                  ) : null}
                </div>
                {(item as any).stickers ? (
                  <div style={{ marginTop: 6, fontSize: 18, color: "#C2C7CF", opacity: 0.95 }}>
                    Stickers: {(item as any).stickers}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 300 }}>
                <div style={{ fontSize: 18, color: "#AEB6C2" }}>Estimated Value</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF" }}>
                  ${(((item as any).est_value_cents ? (item as any).est_value_cents : 0) / 100).toFixed(2)}
                </div>
                <div style={{ marginTop: 8, fontSize: 18, color: "#AEB6C2" }}>{(item as any).weapon as string}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width, height, headers: { "Content-Type": "image/png" } }
  );
}
