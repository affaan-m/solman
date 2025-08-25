import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServer } from "@/lib/supabaseServer";

function genCode(seed: string) {
  const h = crypto.createHash("sha256").update(seed).digest("base64url");
  return h.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "solman";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");
  const supabase = getSupabaseServer();

  if (supabase && user_id) {
    const { data, error } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user_id)
      .eq("active", true)
      .maybeSingle();

    if (!error && data?.code) {
      return NextResponse.json({ code: data.code, persisted: true });
    }

    const code = genCode(user_id);
    try {
      await supabase
        .from("referral_codes")
        .insert({ user_id, code, active: true })
        .select("code")
        .single();
    } catch (e) {
    }

    return NextResponse.json({ code, persisted: true });
  }

  const code = genCode("user");
  return NextResponse.json({ code, persisted: false });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");
  const supabase = getSupabaseServer();
  const code = genCode(String(Date.now()));

  if (supabase && user_id) {
    try {
      await supabase
        .from("referral_codes")
        .update({ active: false })
        .eq("user_id", user_id)
        .eq("active", true);
    } catch (e) {
    }

    try {
      await supabase.from("referral_codes").insert({ user_id, code, active: true });
    } catch (e) {
    }

    return NextResponse.json({ code, rotated: true });
  }

  return NextResponse.json({ code, rotated: false });
}
