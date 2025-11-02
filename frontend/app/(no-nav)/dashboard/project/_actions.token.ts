"use server";

import { getJwtWithDevFallback } from "@/lib/dev-auth";

export type TokenResp =
  | { ok: true; token: string }
  | { ok: false; message?: string };

export async function getApiTokenAction(): Promise<TokenResp> {
  try {
    const token = await getJwtWithDevFallback();
    return { ok: true, token };
  } catch (e) {
    return { ok: false, message: (e as Error).message || "Non autenticato" };
  }
}
