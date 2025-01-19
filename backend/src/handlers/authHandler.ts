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
  otpTable,
} from "../db/schema.js";
import type { User, Session, Otp } from "../db/schema.js";
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
import type { Response } from "express";

export async function authenticate(email: string, res: Response) {
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
      res.status(404).json({ message: message });
    } else {
      message = "applicant";
      res.status(200).json({ message: message });
    }
  } else {
    message = "user";
    res.status(200).json({ message: message });
  }
  return message;
}

// export async function verifyOTP(
//   email: string,
//   otp: string,
//   res: Response): Promise<SessionValidationResult | ApplicantSessionValidationResult> {

//   }

// export async function resendOTP(email: string, res: Response) {
// }
