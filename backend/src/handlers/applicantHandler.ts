import db from "../db/db.js";
import { eq, and } from "drizzle-orm";

import { usersTable } from "../db/schema.js";
import type { User } from "../db/schema.js";
import { validateSessionToken, invalidateSession } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";

export async function getAllApplicants(token: string, res: Response) {
  const sessionValidationResult: SessionValidationResult =
    await validateSessionToken(token);
  if (
    !sessionValidationResult.session ||
    !sessionValidationResult.user ||
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    sessionValidationResult.user["type"] !== "admin"
  ) {
    res.status(400).json({ message: "Token is Invalid Or Expired" });
    console.log({ message: "Token is Invalid Or Expired" });
    return;
  }
  console.log({ message: sessionValidationResult.user });
  const applicants = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.type, "applicant"));
  if (applicants) {
    res.status(200).json({
      message: applicants,
    });
    return;
  }
  res.status(200).json({
    message: [],
  });
}

export async function approveApplicant(
  token: string,
  interests: [],
  id: string,
  res: Response
) {
  const sessionValidationResult: SessionValidationResult =
    await validateSessionToken(token);
  if (
    !sessionValidationResult.session ||
    !sessionValidationResult.user ||
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    sessionValidationResult.user["type"] !== "admin"
  ) {
    res.status(400).json({ message: "Token is Invalid Or Expired" });
    console.log({ message: "Token is Invalid Or Expired" });
    return;
  }
  console.log({ message: sessionValidationResult.user });
  await db
    .update(usersTable)
    .set({ type: "user", interest: interests })
    .where(and(eq(usersTable.id, id), eq(usersTable.type, "applicant")));

  res.status(200).json({
    message: "success",
  });
}

export async function denyApplicant(token: string, id: string, res: Response) {
  const sessionValidationResult: SessionValidationResult =
    await validateSessionToken(token);
  if (
    !sessionValidationResult.session ||
    !sessionValidationResult.user ||
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    sessionValidationResult.user["type"] !== "admin"
  ) {
    res.status(400).json({ message: "Token is Invalid Or Expired" });
    console.log({ message: "Token is Invalid Or Expired" });
    return;
  }
  console.log({ message: sessionValidationResult.user });
  await db
    .update(usersTable)
    .set({ type: "disabled" })
    .where(and(eq(usersTable.id, id), eq(usersTable.type, "applicant")));

  res.status(200).json({
    message: "success",
  });
}
