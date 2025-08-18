// app/(no-nav)/dashboard/_actions/directories.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { directorySchema } from "@/lib/schema/directory";
import { signApiToken } from "@/lib/jwt";
import { cloneRequestHeaders } from "@/lib/headers";

const API = process.env.BACKEND_API_URL!;

async function getSessionAndJwt() {
  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error("Non autenticato");
  const token = await signApiToken(session.user.id);
  return { token };
}

export type DirectoryDTO = { id: string; name: string };

export async function listDirectoriesForUser(): Promise<DirectoryDTO[]> {
  try {
    const { token } = await getSessionAndJwt();
    const res = await fetch(`${API}/api/directories`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function createDirectoryAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const parsed = directorySchema.safeParse({ name });
  if (!parsed.success) {
    return {
      ok: false as const,
      field: "name" as const,
      message: parsed.error.issues[0]?.message || "Nome non valido",
    };
  }

  try {
    const { token } = await getSessionAndJwt();
    const res = await fetch(`${API}/api/directories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: parsed.data.name }),
      cache: "no-store",
    });

    if (res.status === 201) {
      // Idealmente il backend ritorna { id, name }
      let dir: DirectoryDTO | undefined = undefined;
      try {
        dir = (await res.json()) as DirectoryDTO;
      } catch {
        // se non torna JSON, va bene lo stesso
      }
      revalidatePath("/dashboard");
      return { ok: true as const, dir };
    }

    if (res.status === 409) {
      return {
        ok: false as const,
        field: "name" as const,
        message: "Esiste già una directory con questo nome",
      };
    }

    return { ok: false as const, message: "Errore server" };
  } catch (e) {
    return {
      ok: false as const,
      message: (e as Error).message || "Errore di rete",
    };
  }
}
