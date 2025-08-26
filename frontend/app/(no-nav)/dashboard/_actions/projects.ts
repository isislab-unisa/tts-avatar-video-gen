"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { cloneRequestHeaders } from "@/lib/headers";
import { signApiToken } from "@/lib/jwt";

const API = process.env.BACKEND_API_URL!;
if (!API) throw new Error("BACKEND_API_URL non configurato");

async function getJwt(): Promise<string> {
  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error("Non autenticato");
  return await signApiToken(session.user.id);
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

export type ListProjectsResp = { items: ProjectListItem[]; total: number };

export async function listAllProjectsAction(
  page = 1,
  limit = 8,
  sort: "createdAt" | "title" = "createdAt",
  order: "asc" | "desc" = "desc"
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

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!r.ok) return { items: [], total: 0 };

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
  order: "asc" | "desc" = "desc"
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

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!r.ok) return { items: [], total: 0 };

  const data = (await r.json()) as ListProjectsResp;
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: typeof data.total === "number" ? data.total : 0,
  };
}

export async function renameProjectAction(
  id: string,
  title: string
): Promise<boolean> {
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
  if (r.ok) revalidatePath("/dashboard");
  return r.ok;
}

export async function moveProjectAction(
  id: string,
  directoryId: string
): Promise<boolean> {
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
  if (r.ok) revalidatePath("/dashboard");
  return r.ok;
}

export async function deleteProjectAction(id: string): Promise<boolean> {
  const token = await getJwt();
  const r = await fetch(`${API}/api/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (r.ok) revalidatePath("/dashboard");
  return r.ok;
}
