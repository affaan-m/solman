import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REF_COOKIE_NAME = "sm_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function signPayload(payload: string, secret: string) {
  const sig = Buffer.from(secret).toString("base64url").slice(0, 16);
  const value = Buffer.from(JSON.stringify({ p: payload, s: sig })).toString("base64url");
  return value;
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/r/")) {
    const code = url.pathname.split("/").pop() || "";
    const utm_source = url.searchParams.get("utm_source") || undefined;
    const utm_campaign = url.searchParams.get("utm_campaign") || undefined;
    const ts = Date.now();
    const payload = JSON.stringify({ code, utm_source, utm_campaign, ts });
    const secret = process.env.REFERRAL_COOKIE_SECRET || "devsecret";
    const signed = signPayload(payload, secret);
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set(REF_COOKIE_NAME, signed, {
      httpOnly: true,
      maxAge: REF_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/"
    });
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/r/:path*"]
};
