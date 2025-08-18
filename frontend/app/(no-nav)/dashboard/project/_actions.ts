// app/(no-nav)/dashboard/project/_actions.ts
"use server";

import { auth } from "@/lib/auth";
import { signApiToken } from "@/lib/jwt";
import { projectSchema } from "@/lib/schema/project";
import { revalidatePath } from "next/cache";
import { listDirectoriesForUser } from "../_actions/directories";
import { cloneRequestHeaders } from "@/lib/headers";

const API = process.env.BACKEND_API_URL!; // es: http://127.0.0.1:4000

async function getSessionAndJwt() {
  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });
  if (!session) throw new Error("Non autenticato");
  const token = await signApiToken(session.user.id);
  return { token };
}

// per la pagina
export async function getDirectoriesForPage() {
  return await listDirectoriesForUser();
}

// GENERATE (ritorna base64)
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

    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: true, base64: buf.toString("base64") };
  } catch (e) {
    return { ok: false, message: (e as Error).message || "Errore di rete" };
  }
}

// SAVE (multipart con Blob, filename incluso)
export async function saveProjectAction(input: {
  title: string;
  text: string;
  avatar: "cody";
  avatarImage: string;
  directoryId: string;
  base64Video: string;
}): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  try {
    const { token } = await getSessionAndJwt();

    const parsed = projectSchema.safeParse({
      title: input.title,
      text: input.text,
      avatar: input.avatar,
      bgColor: undefined,
    });
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message || "Dati non validi",
      };
    }

    // Node runtime -> Buffer ok
    const bin = Buffer.from(input.base64Video, "base64");
    const file = new Blob([bin], { type: "video/mp4" });

    const form = new FormData();
    form.set("title", input.title);
    form.set("text", input.text);
    form.set("avatar", input.avatar);
    form.set("avatarImage", input.avatarImage);
    form.set("directoryId", input.directoryId);
    form.set("video", file, "output.mp4"); // filename

    const res = await fetch(`${API}/api/projects`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: "no-store",
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return {
        ok: false,
        message: msg || `Errore salvataggio (${res.status})`,
      };
    }

    const data = (await res.json()) as { id: string };
    revalidatePath("/dashboard");
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, message: (e as Error).message || "Errore di rete" };
  }
}
