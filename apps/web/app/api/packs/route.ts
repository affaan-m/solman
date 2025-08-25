import { NextResponse } from "next/server";

export async function GET() {
  const packs = [
    {
      id: "demo-pack",
      name: "Starter Pack",
      price_cents: 499,
      odds: {
        mil_spec: 0.6,
        restricted: 0.25,
        classified: 0.1,
        covert: 0.04,
        legendary: 0.01
      }
    }
  ];
  return NextResponse.json({ packs });
}
