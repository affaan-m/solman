import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");
  const supabase = getSupabaseServer();

  if (!supabase || !user_id) {
    return NextResponse.json({
      clicks: 0,
      signups: 0,
      firstPurchases: 0,
      earningsPoints: 0
    });
  }

  const [{ count: clicks }, { count: signups }, rewards] = await Promise.all([
    supabase.from("referral_visits").select("*", { count: "exact", head: true }).eq("referring_user_id", user_id),
    supabase
      .from("referral_attributions")
      .select("*", { count: "exact", head: true })
      .eq("referring_user_id", user_id),
    supabase
      .from("referral_rewards")
      .select("event_type, points_awarded")
      .eq("referring_user_id", user_id)
  ]);

  const firstPurchases =
    rewards?.data?.filter((r: any) => r.event_type === "first_purchase").length ?? 0;
  const earningsPoints =
    rewards?.data?.reduce((acc: number, r: any) => acc + (r.points_awarded || 0), 0) ?? 0;

  return NextResponse.json({
    clicks: clicks ?? 0,
    signups: signups ?? 0,
    firstPurchases,
    earningsPoints
  });
}
