"use server";

import { auth } from "@/lib/auth";
import { cloneRequestHeaders } from "@/lib/headers";
import { signApiToken } from "@/lib/jwt";

const API = process.env.BACKEND_API_URL!;
if (!API) throw new Error("BACKEND_API_URL non configurato");

export type DirectoryDTO = { id: string; name: string };

async function getToken(): Promise<string> {
  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error("Non autenticato");
  return await signApiToken(session.user.id);
}

export async function listDirectoriesForUser(): Promise<DirectoryDTO[]> {
  const token = await getToken();
  const r = await fetch(`${API}/api/directories`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!r.ok) return [];
  return (await r.json()) as DirectoryDTO[];
}

export async function createDirectoryAction(
  formData: FormData
): Promise<
  | { ok: true; dir: DirectoryDTO }
  | { ok: false; field?: "name"; message: string }
> {
  const token = await getToken();
  const name = String(formData.get("name") || "");
  const r = await fetch(`${API}/api/directories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) {
    if (r.status === 409) {
      return {
        ok: false,
        field: "name",
        message: "Esiste già una cartella con questo nome",
      };
    }
    const msg = await r.text().catch(() => "");
    return { ok: false, message: msg || "Errore creazione" };
  }
  const dir = (await r.json()) as DirectoryDTO;
  return { ok: true, dir };
}

export async function renameDirectoryAction(
  id: string,
  name: string
): Promise<{ ok: true } | { ok: false; field?: "name"; message?: string }> {
  const token = await getToken();
  const r = await fetch(`${API}/api/directories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
    cache: "no-store",
  });
  if (r.ok) return { ok: true };
  if (r.status === 409) {
    return {
      ok: false,
      field: "name",
      message: "Esiste già una cartella con questo nome",
    };
  }
  const msg = await r.text().catch(() => "");
  return { ok: false, message: msg || "Errore rinomina" };
}

export async function deleteDirectoryAction(id: string): Promise<boolean> {
  const token = await getToken();
  const r = await fetch(`${API}/api/directories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return r.ok;
}
