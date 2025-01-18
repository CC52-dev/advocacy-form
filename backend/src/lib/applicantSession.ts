import db from "../db/db.js";
import { eq } from "drizzle-orm";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { applicantsSessionTable, applicantsTable } from "../db/schema.js";
import type { Applicant, ApplicantSession } from "../db/schema.js";

export function generateApplicantSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createApplicantSession(
  token: string,
  applicantId: string
): Promise<ApplicantSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: ApplicantSession = {
    id: sessionId,
    applicantId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(applicantsSessionTable).values(session);
  return session;
}

export async function validateApplicantSessionToken(
  token: string
): Promise<ApplicantSessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: applicantsTable, session: applicantsSessionTable })
    .from(applicantsSessionTable)
    .innerJoin(
      applicantsTable,
      eq(applicantsSessionTable.applicantId, applicantsTable.id)
    )
    .where(eq(applicantsSessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db
      .delete(applicantsSessionTable)
      .where(eq(applicantsSessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(applicantsSessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(applicantsSessionTable.id, session.id));
  }
  return { session, user };
}

export async function invalidateApplicantSession(
  sessionId: string
): Promise<void> {
  await db
    .delete(applicantsSessionTable)
    .where(eq(applicantsSessionTable.id, sessionId));
}

export type ApplicantSessionValidationResult =
  | { session: ApplicantSession; user: Applicant }
  | { session: null; user: null };
