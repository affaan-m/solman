import { NextRequest, NextResponse } from "next/server";

function genCode(seed: string) {
  const s = Buffer.from(seed).toString("base64url").replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase();
  return s || "solman";
}

export async function GET() {
  const code = genCode("user");
  return NextResponse.json({ code });
}

export async function POST(req: NextRequest) {
  const code = genCode(String(Date.now()));
  return NextResponse.json({ code });
}
