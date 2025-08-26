// app/api/jwt/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signApiToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const token = await signApiToken(session.user.id);
  return NextResponse.json({ token });
}
