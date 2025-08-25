import { NextResponse } from "next/server";
import crypto from "crypto";

function genCode(seed: string) {
  const h = crypto.createHash("sha256").update(seed).digest("base64url");
  return h.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "solman";
}

export async function GET() {
  const code = genCode("user");
  return NextResponse.json({ code });
}

export async function POST() {
  const code = genCode(String(Date.now()));
  return NextResponse.json({ code });
}
