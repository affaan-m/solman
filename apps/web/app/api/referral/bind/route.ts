import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { readReferralCookie } from "@/lib/cookies";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");
  const supabase = getSupabaseServer();

  const c = cookies(); // ensure cookies() available in this route
  void c; // no-op to avoid unused var elimination

  const ref = readReferralCookie();

  if (!user_id) {
    return NextResponse.json({ ok: false, error: "missing_user_id" }, { status: 400 });
  }

  if (!supabase || !ref?.code) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    const { data: codeRow, error: codeErr } = await supabase
      .from("referral_codes")
      .select("user_id")
      .eq("code", ref.code)
      .eq("active", true)
      .maybeSingle();

    if (codeErr || !codeRow?.user_id) {
      return NextResponse.json({ ok: false, error: "invalid_ref_code" }, { status: 400 });
    }
    const referring_user_id = codeRow.user_id as string;

    if (referring_user_id === user_id) {
      return NextResponse.json({ ok: false, error: "self_referral_blocked" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("referral_attributions")
      .select("id")
      .eq("referred_user_id", user_id)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ ok: true, alreadyBound: true, persisted: true });
    }

    await supabase.from("referral_attributions").insert({
      referred_user_id: user_id,
      referring_user_id,
      code: ref.code,
      bound_at: new Date().toISOString(),
      method: "cookie",
      ip_hash: null,
      ua_hash: null,
      device_fingerprint_hash: null
    });

    await supabase
      .from("users")
      .update({
        referred_by_user_id: referring_user_id,
        referral_bound_at: new Date().toISOString()
      })
      .eq("id", user_id);

    return NextResponse.json({ ok: true, persisted: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
