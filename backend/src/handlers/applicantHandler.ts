import db from "../db/db.js";
import { eq, and } from "drizzle-orm";

import { usersTable } from "../db/schema.js";
import type { User } from "../db/schema.js";
import { validateSessionToken, invalidateSession } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";

export async function getAllApplicants(token: string, res: Response) {
  try {
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
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function getMyApplication(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(400).json({ message: "Token is Invalid Or Expired" });
      console.log({ message: "Token is Invalid Or Expired" });
      return;
    }
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    if (sessionValidationResult.user["type"] !== "applicant") {
      res
        .status(403)
        .json({ message: "Only applicants can update their application" });
      return;
    }
    const application = await db
      .select()
      .from(usersTable)
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      .where(eq(usersTable.id, sessionValidationResult.user["id"]));
    if (application) {
      res.status(200).json({
        message: application[0],
      });
      return;
    }
    res.status(404).json({
      message: "Application not found",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function updateMyApplication(
  token: string,
  updateData: Partial<User>,
  res: Response
) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(400).json({ message: "Token is Invalid Or Expired" });
      console.log({ message: "Token is Invalid Or Expired" });
      return;
    }
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    if (sessionValidationResult.user["type"] !== "applicant") {
      res
        .status(403)
        .json({ message: "Only applicants can update their application" });
      return;
    }

    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    updateData["type"] = undefined; // Prevent changing user type
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    updateData["id"] = undefined; // Prevent changing user id

    await db
      .update(usersTable)
      .set(updateData)
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      .where(eq(usersTable.id, sessionValidationResult.user["id"]));

    res.status(200).json({
      message: "Application updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function approveApplicant(
  token: string,
  interests: [],
  id: string,
  res: Response
) {
  try {
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
      .set({ type: "user", interest: interests, acceptedAt: new Date() })
      .where(and(eq(usersTable.id, id), eq(usersTable.type, "applicant")));

    res.status(200).json({
      message: "success",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function denyApplicant(token: string, id: string, res: Response) {
  try {
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
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}
