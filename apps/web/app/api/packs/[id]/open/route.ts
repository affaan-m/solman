import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function hmacToRoll(serverSeed: string, clientSeed: string, nonce: number) {
  const h = crypto.createHmac("sha256", serverSeed);
  h.update(`${clientSeed}:${nonce}`);
  const digest = h.digest("hex");
  const n = parseInt(digest.slice(0, 13), 16);
  return n / 0x1fffffffffffff; // ~[0,1)
}

function mapToRarity(x: number) {
  const tiers = [
    { key: "legendary", p: 0.01 },
    { key: "covert", p: 0.04 },
    { key: "classified", p: 0.1 },
    { key: "restricted", p: 0.25 },
    { key: "mil_spec", p: 0.6 }
  ];
  let cum = 0;
  for (const t of tiers) {
    cum += t.p;
    if (x < cum) return t.key;
  }
  return "milspec";
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const clientSeed = body.client_seed || "client";
  const nonce = Number(body.nonce) || 0;

  const serverSeed = crypto.randomBytes(32).toString("hex");
  const serverSeedHash = crypto.createHash("sha256").update(serverSeed).digest("hex");

  const roll = hmacToRoll(serverSeed, clientSeed, nonce);
  const rarity = mapToRarity(roll);

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
      rarity,
      item_template_slug: `demo-${rarity}`
    }
  });
}
