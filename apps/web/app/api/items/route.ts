import { NextResponse } from "next/server";
import items from "@/data/items.json";

export async function GET() {
  return NextResponse.json(items);
}
