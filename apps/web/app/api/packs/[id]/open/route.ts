import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import packs from "@/data/packs.json";
import items from "@/data/items.json";
import { solveLambda, tieredProbs, cdf, sampleIndexFromRoll } from "@/lib/evSampler";

function hmacToRoll(serverSeed: string, clientSeed: string, nonce: number) {
  const h = crypto.createHmac("sha256", serverSeed);
  h.update(`${clientSeed}:${nonce}`);
  const digest = h.digest("hex");
  const n = parseInt(digest.slice(0, 13), 16);
  return n / 0x1fffffffffffff;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const clientSeed = body.client_seed || "client";
  const nonce = Number(body.nonce) || 0;

  const serverSeed = crypto.randomBytes(32).toString("hex");
  const serverSeedHash = crypto.createHash("sha256").update(serverSeed).digest("hex");

  const roll = hmacToRoll(serverSeed, clientSeed, nonce);

  const pack = (packs as any[]).find((p) => p.id === params.id);
  if (!pack) {
    return NextResponse.json({ error: "pack_not_found" }, { status: 404 });
  }

  const pool = (items as any[]).filter((it) => pack.pool_slugs.includes(it.slug));
  if (pool.length === 0) {
    return NextResponse.json({ error: "empty_pack_pool" }, { status: 400 });
  }

  const values = pool.map((it) => it.est_value_cents as number);
  const targetEV = Math.max(0, (1 - (pack.target_edge ?? 0.1)) * (pack.price_cents as number));
  const lambda = solveLambda(values, targetEV);
  const probs = tieredProbs(
    pool.map((it) => ({ slug: it.slug, est_value_cents: it.est_value_cents, rarity: it.rarity })),
    pack.rarity_mass,
    lambda
  );
  const C = cdf(probs);
  const idx = sampleIndexFromRoll(C, roll);
  const chosen = pool[idx];

  return NextResponse.json({
    pack_id: params.id,
    server_seed_hash: serverSeedHash,
    reveal: {
      server_seed: serverSeed,
      client_seed: clientSeed,
      nonce
    },
    outcome: {
      roll,
      item_template_slug: chosen.slug,
      name: chosen.name,
      rarity: chosen.rarity,
      condition: chosen.condition,
      float: chosen.float,
      value_cents: chosen.est_value_cents,
      art_url: chosen.art_url
    }
  });
}
