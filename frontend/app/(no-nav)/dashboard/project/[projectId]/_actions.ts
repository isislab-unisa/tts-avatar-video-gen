// app/(no-nav)/dashboard/project/[projectId]/_actions.ts
"use server";

export type ProjectDTO = {
  id: string;
  title: string;
  text: string;
  directoryId: string;
  createdAt: string;
  avatar: string;
  avatarImage: string;
  bucketId: string;
  downloadUrl: string;
};

const BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:4000";

async function api<T = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "Request failed"));
  return (await res.json().catch(() => ({}))) as T;
}

export async function renameProjectAction(projectId: string, title: string) {
  try {
    await api(`${BASE}/api/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function moveProjectAction(
  projectId: string,
  directoryId: string
) {
  try {
    await api(`${BASE}/api/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({ directoryId }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const res = await fetch(`${BASE}/api/projects/${projectId}`, {
      method: "DELETE",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}
