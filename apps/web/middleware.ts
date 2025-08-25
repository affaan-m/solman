import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE_NAME = "solman_ref";

function sign(value: string, secret: string) {
  return value + "." + Buffer.from(secret).toString("base64url").slice(0, 8);
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/r/")) {
    const code = url.pathname.split("/").pop() || "";
    const secret = process.env.REFERRAL_COOKIE_SECRET || "devsecret";
    const payload = JSON.stringify({ code, ts: Date.now() });
    const signed = sign(Buffer.from(payload).toString("base64url"), secret);
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set(COOKIE_NAME, signed, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
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
