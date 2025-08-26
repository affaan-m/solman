"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function PackOpenPage({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const startSpin = async () => {
    setSpinning(true);
    setResult(null);
    const client_seed = "web-demo";
    const nonce = Date.now();
    const res = await fetch(`/api/packs/${params.id}/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_seed, nonce })
    });
    const data = await res.json();
    const filler = Array.from({ length: 24 }).map((_, i) => ({
      key: `f-${i}`,
      name: "Mystery",
      rarity: ["mil_spec", "restricted", "classified", "covert"][i % 4],
      art_url: "https://dummyimage.com/120x80/111/fff&text=?"
    }));
    const list = [...filler, { key: "win", ...data.outcome }];
    setCards(list);
    setTimeout(() => {
      setResult(data);
      setSpinning(false);
    }, 1400);
  };

  const trackWidth = useMemo(() => cards.length * 140, [cards.length]);

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
          animate={{ x: spinning ? -trackWidth : 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ width: trackWidth }}
        >
          {cards.map((c, idx) => (
            <div
              key={idx}
              className="w-32 h-24 rounded flex items-center justify-center text-xs"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
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
                <Image src={c.art_url} alt={c.name} width={120} height={80} />
              ) : (
                <span>{c.name}</span>
              )}
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/40 pointer-events-none" />
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
