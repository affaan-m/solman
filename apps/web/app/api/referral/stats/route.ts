import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clicks: 0,
    signups: 0,
    earningsPoints: 0
  });
}
