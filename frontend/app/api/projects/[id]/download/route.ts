import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloneRequestHeaders } from "@/lib/headers";
import { signApiToken } from "@/lib/jwt";

const API = process.env.BACKEND_API_URL!;
if (!API) throw new Error("BACKEND_API_URL non configurato");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verifica autenticazione
    const headers = await cloneRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Ottieni JWT per il backend
    const token = await signApiToken(session.user.id);

    // Chiama il backend per ottenere l'URL di download
    const backendUrl = `${API}/api/projects/${id}/download`;
    const response = await fetch(backendUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "manual",
    });

    if (!response.ok && response.status !== 302 && response.status !== 301) {
      const errorText = await response.text().catch(() => "Errore download");
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    // Gestisci redirect
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get("Location");
      if (location) {
        return NextResponse.redirect(location, 302);
      }
    }

    // Gestisci risposta con URL
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { url?: string };
      if (data?.url) {
        return NextResponse.redirect(data.url);
      }
    } else {
      const text = await response.text();
      if (text && /^https?:\/\//.test(text)) {
        return NextResponse.redirect(text.trim());
      }
    }

    return NextResponse.json(
      { error: "URL di download non trovato" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Errore download progetto:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
