import db from "../db/db.js";
import { eq } from "drizzle-orm";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { sessionTable, usersTable, userRolesTable } from "../db/schema.js";
import type { User, Session } from "../db/schema.js";
import { getUserPermissions } from "./permissions.js";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: usersTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(usersTable, eq(sessionTable.userId, usersTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  // Helper function to parse permissions
  const parsePermissions = (perms: any): string[] => {
    if (Array.isArray(perms)) return perms;
    if (typeof perms === 'string') {
      try {
        const parsed = JSON.parse(perms);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };
  
  // Check if user has "disabled" permission (exclusive permission)
  const userRoles = await db
    .select()
    .from(userRolesTable)
    .where(eq(userRolesTable.userId, user.id));
  
  const hasDisabledPermission = userRoles.some((userRole) => {
    const permissions = parsePermissions(userRole.permissions);
    return permissions.includes("disabled");
  });

  if (hasDisabledPermission) {
    // Invalidate session if user is disabled
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }

  // Get user's permissions
  const permissions = await getUserPermissions(user.id);

  // Add roles and permissions to user object
  // Parse permissions from JSON strings (reuse parsePermissions from above)
  const formattedRoles = userRoles.map(ur => ({
    id: ur.id,
    roleTitle: ur.roleTitle,
    permissions: parsePermissions(ur.permissions),
  }));
  
  const userWithRoles = {
    ...user,
    roles: formattedRoles,
    permissions: permissions,
  };

  return { session, user: userWithRoles as User };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
