"use server";

import { cloneRequestHeaders } from "@/lib/headers";
import { auth } from "@/lib/auth";
import { signApiToken } from "@/lib/jwt";

export type TokenResp =
  | { ok: true; token: string }
  | { ok: false; message?: string };

export async function getApiTokenAction(): Promise<TokenResp> {
  try {
    const headers = await cloneRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) return { ok: false, message: "Non autenticato" };
    const token = await signApiToken(session.user.id);
    return { ok: true, token };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
