// app/api/jwt/route.ts
import { NextResponse } from "next/server";
import { getJwtWithDevFallback } from "@/lib/dev-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getJwtWithDevFallback();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
