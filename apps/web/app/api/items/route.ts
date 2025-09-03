import { NextResponse } from "next/server";
import { getItems } from "@/lib/itemsSource";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getItems();
  return NextResponse.json(items);
}
