"use server";

import { getJwtWithDevFallback } from "@/lib/dev-auth";

const API = process.env.BACKEND_API_URL!;

async function getToken(): Promise<string> {
  try {
    return await getJwtWithDevFallback();
  } catch {
    throw new Error("Non autenticato");
  }
}

export async function generateVideoAction(input: {
  text: string;
  avatar: "cody";
  bgColor?: string;
  title?: string;
}): Promise<
  | { ok: true; base64: string; tempPath?: string }
  | { ok: false; message: string }
> {
  try {
    const token = await getToken();
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
    const tempPath = res.headers.get("x-generator-output") || undefined;
    const ab = await res.arrayBuffer();
    return { ok: true, base64: Buffer.from(ab).toString("base64"), tempPath };
  } catch (error) {
    return { ok: false, message: (error as Error).message || "Errore di rete" };
  }
}

export async function cleanupGeneratedTemp(path: string | undefined) {
  if (!path) return;
  try {
    const token = await getToken();
    await fetch(`${API}/api/generate/cleanup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ path }),
      cache: "no-store",
    });
  } catch {
    return;
  }
}
