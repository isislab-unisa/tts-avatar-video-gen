"use server";

import { auth } from "@/lib/auth";
import { signApiToken } from "@/lib/jwt";
import { cloneRequestHeaders } from "@/lib/headers";

const API = process.env.BACKEND_API_URL!;

async function getSessionAndJwt(): Promise<{ token: string }> {
  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error("Non autenticato");
  const token = await signApiToken(session.user.id);
  return { token };
}

export async function generateVideoAction(input: {
  text: string;
  avatar: "cody";
  bgColor?: string;
}): Promise<{ ok: true; base64: string } | { ok: false; message: string }> {
  try {
    const { token } = await getSessionAndJwt();
    const res = await fetch(`${API}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return { ok: false, message: msg || `Errore generatore (${res.status})` };
    }
    const ab = await res.arrayBuffer();
    return { ok: true, base64: Buffer.from(ab).toString("base64") };
  } catch (error) {
    return { ok: false, message: (error as Error).message || "Errore di rete" };
  }
}
