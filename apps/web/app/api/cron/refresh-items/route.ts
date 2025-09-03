import { NextRequest, NextResponse } from "next/server";
import { clearItemsCache, refreshItemsCache } from "@/lib/itemsSource";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || "";
  const authHeader = req.headers.get("authorization") || "";
  const urlKey = req.nextUrl.searchParams.get("key") || "";
  const vercelCron = req.headers.get("x-vercel-cron");

  if (secret) {
    if (authHeader === `Bearer ${secret}`) return true;
    if (urlKey === secret) return true;
    // allow during local dev without secret
    if (process.env.NODE_ENV !== "production") return true;
    return false;
  }
  // If no secret configured, only allow Vercel Cron calls (they include this header)
  return !!vercelCron;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  clearItemsCache();
  const items = await refreshItemsCache();
  return NextResponse.json({
    ok: true,
    refreshed: items.length,
    ts: new Date().toISOString()
  });
}
