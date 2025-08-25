import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { hashDevice } from "@/lib/hashing";

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
  const ref_code = body.ref_code || refCookie?.code || null;
  const utm_source = body.utm_source || refCookie?.utm_source || null;
  const utm_campaign = body.utm_campaign || refCookie?.utm_campaign || null;

  let inserted = false;
  const supabase = getSupabaseServer();
  if (supabase && ref_code) {
    try {
      const ip_hash = ip ? hashDevice(ip, "", "", process.env.DEVICE_HASH_PEPPER || "") : null;
      const ua_hash = ua ? hashDevice("", ua, "", process.env.DEVICE_HASH_PEPPER || "") : null;
      const device_hash = device_fingerprint
        ? hashDevice("", "", device_fingerprint, process.env.DEVICE_HASH_PEPPER || "")
        : null;

      let referring_user_id: string | null = null;
      const { data: codeRow, error: codeErr } = await supabase
        .from("referral_codes")
        .select("user_id")
        .eq("code", ref_code)
        .eq("active", true)
        .maybeSingle();
      if (!codeErr && codeRow?.user_id) {
        referring_user_id = codeRow.user_id as string;
      }

      const { error } = await supabase.from("referral_visits").insert({
        code: ref_code,
        referring_user_id,
        utm_source,
        utm_campaign,
        ip_hash,
        ua_hash,
        device_fingerprint_hash: device_hash,
        first_seen_at: new Date().toISOString()
      });

      if (!error) {
        inserted = true;
        if (referring_user_id) {
          await supabase
            .from("referral_codes")
            .update({ last_used_at: new Date().toISOString() })
            .eq("code", ref_code)
            .eq("active", true);
        }
      }
    } catch {
      inserted = false;
    }
  }

  return NextResponse.json({
    ok: true,
    ref_code,
    utm_source,
    utm_campaign,
    saved: inserted
  });
}
