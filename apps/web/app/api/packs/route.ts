import { NextResponse } from "next/server";
import packs from "@/data/packs.json";
import { getItems } from "@/lib/itemsSource";

export async function GET() {
  // Warm items cache alongside packs fetch to keep pack opens fast
  try {
    await getItems();
  } catch {}
  return NextResponse.json(packs);
}
