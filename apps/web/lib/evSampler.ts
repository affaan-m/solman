export type Item = {
  slug: string;
  est_value_cents: number;
  rarity: "mil_spec" | "restricted" | "classified" | "covert" | "legendary";
};

export function normalize(xs: number[]) {
  const s = xs.reduce((a, b) => a + b, 0);
  if (s <= 0) return xs.map(() => 0);
  return xs.map((x) => x / s);
}

export function weights(values: number[], lambda: number) {
  return values.map((v) => Math.exp(-lambda * v));
}

export function expectedValue(values: number[], probs: number[]) {
  let s = 0;
  for (let i = 0; i < values.length; i++) s += values[i] * probs[i];
  return s;
}

export function solveLambda(values: number[], targetEV: number) {
  const f = (lambda: number) => {
    const p = normalize(weights(values, lambda));
    return expectedValue(values, p);
  };
  let lo = 0;
  let hi = 1e-6;
  while (f(hi) > targetEV) hi *= 2;
  let it = 0;
  while (it++ < 80 && hi - lo > 1e-12) {
    const mid = (lo + hi) / 2;
    if (f(mid) > targetEV) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function cdf(probs: number[]) {
  const out: number[] = [];
  let cum = 0;
  for (const p of probs) {
    cum += p;
    out.push(cum);
  }
  if (out.length > 0) out[out.length - 1] = 1;
  return out;
}

export function sampleIndexFromRoll(cumulative: number[], roll: number) {
  for (let i = 0; i < cumulative.length; i++) {
    if (roll <= cumulative[i]) return i;
  }
  return cumulative.length - 1;
}

export function tieredProbs(
  items: Item[],
  rarityMass: Record<Item["rarity"], number>,
  lambda: number
) {
  const values = items.map((it) => it.est_value_cents);
  const perTier: Record<Item["rarity"], { idxs: number[]; vals: number[] }> = {
    mil_spec: { idxs: [], vals: [] },
    restricted: { idxs: [], vals: [] },
    classified: { idxs: [], vals: [] },
    covert: { idxs: [], vals: [] },
    legendary: { idxs: [], vals: [] }
  };
  items.forEach((it, i) => {
    perTier[it.rarity].idxs.push(i);
    perTier[it.rarity].vals.push(values[i]);
  });
  const result = new Array(items.length).fill(0);
  (["mil_spec", "restricted", "classified", "covert", "legendary"] as const).forEach((tier) => {
    const group = perTier[tier];
    if (group.idxs.length === 0) return;
    const w = weights(group.vals, lambda);
    const p = normalize(w).map((x) => x * (rarityMass[tier] ?? 0));
    group.idxs.forEach((idx, j) => {
      result[idx] = p[j];
    });
  });
  const total = result.reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (let i = 0; i < result.length; i++) result[i] /= total;
  }
  return result;
}
