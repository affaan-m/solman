import { NextResponse } from "next/server";
import packs from "@/data/packs.json";
import { getItems } from "@/lib/itemsSource";

export async function GET() {
  // Warm items cache alongside packs fetch to keep pack opens fast
  try {
    await getItems();
  } catch (err) {
    console.warn("[packs/list] getItems warm failed", err);
  }
  console.log("[packs/list] returning packs", { count: (packs as any[]).length });
  return NextResponse.json(packs);
}
