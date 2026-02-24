import type { Request } from "express";

/**
 * Extract session token from request.
 * Supports both Cookie header (web) and Authorization: Bearer (mobile/React Native).
 */
export function getSessionToken(req: Request): string | undefined {
  const fromCookie = req.headers.cookie?.split("session_token=")[1]?.split(";")[0]?.trim();
  if (fromCookie) return fromCookie;

  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }

  return undefined;
}
