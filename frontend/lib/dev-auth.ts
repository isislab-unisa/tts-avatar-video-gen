import { auth } from "@/lib/auth";
import { cloneRequestHeaders } from "@/lib/headers";
import { signApiToken } from "@/lib/jwt";

/**
 * Checks if dev mode is enabled
 */
export function isDevMode(): boolean {
  return process.env.DEV_MODE === "true";
}

/**
 * Gets the dev user ID from environment
 */
export function getDevUserId(): string {
  return process.env.DEV_USER_ID || "dev-user-local";
}

/**
 * Gets a dev mode token if dev mode is enabled, otherwise null
 */
export async function getDevToken(): Promise<string | null> {
  if (!isDevMode()) return null;
  const userId = getDevUserId();
  return await signApiToken(userId);
}

/**
 * Gets session or dev mode user info
 * Returns null if neither session nor dev mode is available
 */
export async function getSessionOrDev(): Promise<{
  user: { id: string; name: string; email: string; image?: string | null };
  isDev: boolean;
} | null> {
  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });

  if (session) {
    return { user: session.user, isDev: false };
  }

  // If no session but dev mode is enabled, return dev user
  if (isDevMode()) {
    const devUserId = getDevUserId();
    return {
      user: {
        id: devUserId,
        name: "Dev User",
        email: "dev@local.test",
        image: null,
      },
      isDev: true,
    };
  }

  return null;
}

/**
 * Gets JWT token, using dev mode if no session is available
 */
export async function getJwtWithDevFallback(): Promise<string> {
  const h = await cloneRequestHeaders();
  const session = await auth.api.getSession({ headers: h });

  if (session) {
    return await signApiToken(session.user.id);
  }

  // Fallback to dev mode token if enabled
  if (isDevMode()) {
    const userId = getDevUserId();
    return await signApiToken(userId);
  }

  throw new Error("Non autenticato");
}
