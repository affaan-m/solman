"use client";

import useSWR from "swr";
import Link from "next/link";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function PacksPage() {
  const { data } = useSWR("/api/packs", fetcher);
  const packs = (data as any[]) || [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Packs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((p) => (
          <Link key={p.id} href={`/packs/${p.id}`} className="block rounded-lg border border-orange-600/20 p-4 hover:border-orange-500/50">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm opacity-80">${(p.price_cents / 100).toFixed(2)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
