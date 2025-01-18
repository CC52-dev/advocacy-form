import db from "../db/db.js";
import { eq } from "drizzle-orm";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  sessionTable,
  usersTable,
  applicantsSessionTable,
  applicantsTable,
} from "../db/schema.js";
import type { User, Session } from "../db/schema.js";
import {
  createSession,
  validateSessionToken,
  invalidateSession,
} from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import {
  createApplicantSession,
  validateApplicantSessionToken,
  invalidateApplicantSession,
} from "../lib/applicantSession.js";
import type { ApplicantSessionValidationResult } from "../lib/applicantSession.js";

export async function authenticate(email: string) {
  const user: User = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .then((rows) => rows[0]);
  type message = object | string;
  let message: message = null;
  if (!user) {
    const applicant = await db
      .select()
      .from(applicantsTable)
      .where(eq(applicantsTable.email, email))
      .then((rows) => rows[0]);
    if (!applicant) {
      message = "User not found";
    } else {
      message = applicant;
    }
  } else {
    message = user;
  }
  return message;
}
