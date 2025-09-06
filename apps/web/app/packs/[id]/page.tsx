"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function PackOpenPage({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [slugToItem, setSlugToItem] = useState<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load items for visual filler with consistent art and rarity colors
    fetch("/api/items")
      .then((r) => r.json())
      .then((items) => {
        setCatalog(items);
        const map: Record<string, any> = {};
        for (const it of items) map[it.slug] = it;
        setSlugToItem(map);
      })
      .catch(() => setCatalog([]));
  }, []);

  const sideviewFor = (item: any) => {
    const toKey = (s: string) => (s || "").replace(/\s+/g, "-").replace(/[^A-Za-z0-9\-]/g, "");
    const weapon = toKey(item.weapon || "");
    const skin = toKey(item.skin_family || "");
    if (!weapon || !skin) return item.art_url;
    const combo = `${weapon}-${skin}`;
    return `/branding/cs2_skin_sideviews/${combo}/${combo}_s82.png`;
  };

  const startSpin = async () => {
    setSpinning(true);
    setResult(null);
    setWinningIndex(null);
    const client_seed = "web-demo";
    const nonce = Date.now();
    const res = await fetch(`/api/packs/${params.id}/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_seed, nonce })
    });
    const data = await res.json();
    const fillerSource = catalog.length > 0 ? catalog : Array.from({ length: 24 }).map((_, i) => ({
      name: "Mystery",
      rarity: ["mil_spec", "restricted", "classified", "covert"][i % 4],
      art_url: "https://dummyimage.com/320x200/111/fff&text=?"
    }));
    const filler = Array.from({ length: 24 }).map((_, i) => {
      const it = fillerSource[i % fillerSource.length];
      return {
        key: `f-${i}`,
        name: it.name,
        rarity: it.rarity,
        art_url: it.weapon && it.skin_family ? sideviewFor(it) : it.art_url
      };
    });
    // Attach sideview art for the winning item if we can resolve via slug
    let win = { key: "win", ...data.outcome } as any;
    if (data.outcome?.item_template_slug && slugToItem[data.outcome.item_template_slug]) {
      const base = slugToItem[data.outcome.item_template_slug];
      win.art_url = sideviewFor(base);
      if (!win.name) win.name = base.name;
      if (!win.rarity) win.rarity = base.rarity;
    }
    const list = [...filler, win];
    setCards(list);
    setWinningIndex(list.length - 1);
    setTimeout(() => {
      setResult(data);
      setSpinning(false);
    }, 1400);
  };

  const CARD_SLOT = 136; // ~128px card + 8px gap
  const trackWidth = useMemo(() => cards.length * CARD_SLOT, [cards.length]);
  const targetOffset = useMemo(() => {
    if (winningIndex == null) return 0;
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const centerX = containerWidth / 2;
    const winningCenter = winningIndex * CARD_SLOT + CARD_SLOT / 2;
    // Adjust for the slight left padding (left-2) of the strip
    const leftPadding = 8;
    return -(winningCenter + leftPadding - centerX);
  }, [winningIndex, cards.length]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Open Pack</h1>
      <button
        onClick={startSpin}
        disabled={spinning}
        className="px-4 py-2 bg-brand-green text-black rounded disabled:opacity-50"
      >
        {spinning ? "Spinning..." : "Open"}
      </button>

      <div className="overflow-hidden border border-white/10 rounded h-32 relative" ref={containerRef}>
        <motion.div
          className="flex items-center gap-2 absolute left-2 top-2"
          animate={{ x: spinning && winningIndex != null ? targetOffset : 0 }}
          transition={{ duration: 2.6, ease: [0.17, 0.67, 0.14, 0.93] }}
          style={{ width: trackWidth }}
        >
          {cards.map((c, idx) => (
            <div
              key={idx}
              className="w-32 h-24 rounded overflow-hidden relative"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                background:
                  c.rarity === "legendary"
                    ? "linear-gradient(135deg,#FFD70022,#FFD70008)"
                    : c.rarity === "covert"
                    ? "linear-gradient(135deg,#E74C3C22,#E74C3C08)"
                    : c.rarity === "classified"
                    ? "linear-gradient(135deg,#9B59B622,#9B59B608)"
                    : c.rarity === "restricted"
                    ? "linear-gradient(135deg,#4C6FFF22,#4C6FFF08)"
                    : "linear-gradient(135deg,#B0B0B022,#B0B0B008)"
              }}
            >
              {c.art_url ? (
                <Image src={c.art_url} alt={c.name} width={128} height={96} className="object-cover w-full h-full" />
              ) : null}
              <div className="absolute bottom-0 left-0 right-0 text-[10px] px-1 py-0.5 bg-black/40 backdrop-blur-sm truncate">
                {c.name}
              </div>
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/40 pointer-events-none" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {result && (
        <div className="border border-white/10 rounded p-4">
          <div className="flex items-center gap-4">
            {result.outcome.art_url && (
              <Image
                src={result.outcome.art_url}
                alt={result.outcome.name}
                width={120}
                height={80}
                className="rounded"
              />
            )}
            <div>
              <div className="font-semibold">{result.outcome.name}</div>
              <div className="text-sm opacity-80">
                {result.outcome.rarity} • {result.outcome.condition} • float {result.outcome.float}
              </div>
              <div className="text-sm">${(result.outcome.value_cents / 100).toFixed(2)}</div>
            </div>
          </div>
          <details className="mt-3">
            <summary>Verify</summary>
            <pre className="text-xs whitespace-pre-wrap">
{`server_seed_hash: ${result.server_seed_hash}
server_seed: ${result.reveal.server_seed}
client_seed: ${result.reveal.client_seed}
nonce: ${result.reveal.nonce}
roll: ${result.outcome.roll}`}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
