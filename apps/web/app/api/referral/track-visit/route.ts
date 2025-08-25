import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

function readRefCookie(req: NextRequest) {
  const raw = req.cookies.get("sm_ref")?.value;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64url").toString();
    const obj = JSON.parse(decoded) as { p: string; s: string };
    const payload = JSON.parse(obj.p);
    return payload;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const refCookie = readRefCookie(req);
  const h = headers();
  const ip = req.ip || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const ua = h.get("user-agent") || "";
  const device_fingerprint = String(body.fingerprint || "");

  const result = {
    ok: true,
    ref_code: body.ref_code || refCookie?.code || null,
    utm_source: body.utm_source || refCookie?.utm_source || null,
    utm_campaign: body.utm_campaign || refCookie?.utm_campaign || null,
    ip_present: Boolean(ip),
    ua_present: Boolean(ua),
    device_fingerprint_present: Boolean(device_fingerprint)
  };

  return NextResponse.json(result);
}
