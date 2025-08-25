import { cookies } from "next/headers";
import { REF_COOKIE_NAME, REF_COOKIE_MAX_AGE, REFERRAL_COOKIE_SECRET } from "./constants";
import { hmacHex } from "./hashing";

export function setReferralCookie(data: Record<string, any>) {
  const c = cookies();
  const payload = JSON.stringify(data);
  const sig = hmacHex(REFERRAL_COOKIE_SECRET, payload);
  const value = Buffer.from(JSON.stringify({ p: payload, s: sig })).toString("base64url");
  c.set(REF_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: REF_COOKIE_MAX_AGE,
    path: "/"
  });
}

export function readReferralCookie(): null | Record<string, any> {
  const c = cookies();
  const raw = c.get(REF_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64url").toString();
    const obj = JSON.parse(decoded) as { p: string; s: string };
    const expected = hmacHex(REFERRAL_COOKIE_SECRET, obj.p);
    if (expected !== obj.s) return null;
    return JSON.parse(obj.p);
  } catch {
    return null;
  }
}
