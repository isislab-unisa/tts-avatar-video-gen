"use server";

import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/error-translations";
import { getJwtWithDevFallback } from "@/lib/dev-auth";

const API = process.env.BACKEND_API_URL;
if (!API) throw new Error("BACKEND_API_URL non configurato");

async function getJwt(): Promise<string> {
  try {
    return await getJwtWithDevFallback();
  } catch {
    throw new Error(getErrorMessage("notAuthenticated"));
  }
}

export type ProjectListItem = {
  id: string;
  title: string;
  createdAt: string;
  avatar: string;
  avatarImage: string;
  directoryId: string;
  directoryName?: string;
};

export type ListProjectsResp = {
  items: ProjectListItem[];
  total: number;
};

export async function listAllProjectsAction(
  page = 1,
  limit = 8,
  sort: "createdAt" | "title" = "createdAt",
  order: "asc" | "desc" = "desc",
  q?: string
): Promise<ListProjectsResp> {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 8);
  const skip = (p - 1) * l;

  const token = await getJwt();
  const url = new URL(`${API}/api/projects/all`);
  url.searchParams.set("limit", String(l));
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("sort", sort);
  url.searchParams.set("order", order);
  if (q && q.trim()) url.searchParams.set("q", q.trim());

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!r.ok) {
    return { items: [], total: 0 };
  }

  const data = (await r.json()) as ListProjectsResp;
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: typeof data.total === "number" ? data.total : 0,
  };
}

export async function listProjectsByDirAction(
  directoryId: string,
  page = 1,
  limit = 8,
  sort: "createdAt" | "title" = "createdAt",
  order: "asc" | "desc" = "desc",
  q?: string
): Promise<ListProjectsResp> {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 8);
  const skip = (p - 1) * l;

  const token = await getJwt();
  const url = new URL(`${API}/api/projects`);
  url.searchParams.set("dir", directoryId);
  url.searchParams.set("limit", String(l));
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("sort", sort);
  url.searchParams.set("order", order);
  if (q && q.trim()) url.searchParams.set("q", q.trim());

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!r.ok) {
    return { items: [], total: 0 };
  }

  const data = (await r.json()) as ListProjectsResp;
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: typeof data.total === "number" ? data.total : 0,
  };
}

export async function renameProjectAction(
  id: string,
  title: string
): Promise<{ ok: true } | { ok: false; field?: "title"; message?: string }> {
  const token = await getJwt();
  const r = await fetch(`${API}/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: title.trim() }),
    cache: "no-store",
  });

  if (r.ok) {
    revalidatePath("/dashboard");
    return { ok: true };
  }

  if (r.status === 409) {
    return {
      ok: false,
      field: "title",
      message: getErrorMessage("duplicateTitle"),
    };
  }

  const msg = await r.text().catch(() => "");
  return { ok: false, message: msg || getErrorMessage("renameError") };
}

export async function moveProjectAction(
  id: string,
  directoryId: string
): Promise<{ ok: boolean; message?: string }> {
  const token = await getJwt();
  const r = await fetch(`${API}/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ directoryId }),
    cache: "no-store",
  });

  if (r.ok) {
    revalidatePath("/dashboard");
    return { ok: true };
  }

  const msg = await r.text().catch(() => "");
  return { ok: false, message: msg || getErrorMessage("moveError") };
}

export async function deleteProjectAction(
  id: string
): Promise<{ ok: boolean; message?: string }> {
  const token = await getJwt();
  const r = await fetch(`${API}/api/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (r.ok) {
    revalidatePath("/dashboard");
    return { ok: true };
  }

  const msg = await r.text().catch(() => "");
  return { ok: false, message: msg || getErrorMessage("deleteError") };
}

// Prende i dettagli del progetto dal backend e restituisce la URL finale (presigned) da usare lato client.
export async function getProjectDownloadUrlAction(
  id: string
): Promise<{ ok: true; url: string } | { ok: false; message?: string }> {
  const token = await getJwt();
  const r = await fetch(`${API}/api/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    return {
      ok: false,
      message: msg || getErrorMessage("projectNotFound"),
    };
  }

  const data = (await r.json()) as { downloadUrl?: string };
  if (data?.downloadUrl) return { ok: true, url: data.downloadUrl };

  return { ok: false, message: getErrorMessage("downloadUrlMissing") };
}

// Ottiene l'URL presigned per la visualizzazione del video
export async function getProjectVideoUrlAction(
  id: string
): Promise<{ ok: true; url: string } | { ok: false; message?: string }> {
  const token = await getJwt();
  const r = await fetch(`${API}/api/projects/${id}/video`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    return {
      ok: false,
      message: msg || getErrorMessage("projectNotFound"),
    };
  }

  const data = (await r.json()) as { videoUrl?: string };
  if (data?.videoUrl) return { ok: true, url: data.videoUrl };

  return { ok: false, message: getErrorMessage("videoUrlMissing") };
}
