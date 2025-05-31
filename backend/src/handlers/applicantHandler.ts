import db from "../db/db.js";
import { eq, and } from "drizzle-orm";

import { usersTable } from "../db/schema.js";
import type { User } from "../db/schema.js";
import { validateSessionToken, invalidateSession, invalidateAllUserSessions } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";
import { emailService } from "../lib/emailService.js";

export async function getAllApplicants(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user ||
      (sessionValidationResult.user["type"] !== "admin" && sessionValidationResult.user["type"] !== "adminviewer")
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
      sessionValidationResult.user["type"] !== "admin"
    ) {
      res.status(400).json({ message: "Token is Invalid Or Expired" });
      console.log({ message: "Token is Invalid Or Expired" });
      return;
    }
    console.log({ message: sessionValidationResult.user });

    // Get applicant details before updating
    const applicant = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!applicant[0]) {
      res.status(400).json({ message: "Applicant not found" });
      return;
    }

    await db
      .update(usersTable)
      .set({ type: "user", interest: interests, acceptedAt: new Date() })
      .where(and(eq(usersTable.id, id), eq(usersTable.type, "applicant")));

    // Send approval email
    await emailService.sendApprovalEmail(
      applicant[0].email,
      `${applicant[0].firstname} ${applicant[0].lastname}`
    );

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
      sessionValidationResult.user["type"] !== "admin"
    ) {
      res.status(400).json({ message: "Token is Invalid Or Expired" });
      console.log({ message: "Token is Invalid Or Expired" });
      return;
    }
    console.log({ message: sessionValidationResult.user });

    // Get applicant details before updating
    const applicant = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!applicant[0]) {
      res.status(400).json({ message: "Applicant not found" });
      return;
    }

    await db
      .update(usersTable)
      .set({ type: "disabled" })
      .where(and(eq(usersTable.id, id), eq(usersTable.type, "applicant")));

    // Revoke all sessions for the denied applicant
    await invalidateAllUserSessions(id);

    // Send rejection email
    await emailService.sendRejectionEmail(
      applicant[0].email,
      `${applicant[0].firstname} ${applicant[0].lastname}`
    );

    res.status(200).json({
      message: "success",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}

export async function updateApplicantSelf(
  token: string,
  updateData: any,
  res: Response
) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    
    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user ||
      sessionValidationResult.user["type"] !== "applicant"
    ) {
      res.status(400).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Validate that the user exists and is an applicant
    const applicant = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!applicant[0] || applicant[0].type !== "applicant") {
      res.status(400).json({ message: "Applicant not found or invalid status" });
      return;
    }

    // Only allow updating certain fields for applicants
    const allowedFields = {
      firstname: updateData.firstname,
      lastname: updateData.lastname,
      phone: updateData.phone,
      location: updateData.location,
      addr: updateData.addr,
      city: updateData.city,
      zip: updateData.zip,
      interest: updateData.interest,
    };

    // Remove undefined fields
    const filteredUpdateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdateData).length === 0) {
      res.status(400).json({ message: "No valid fields to update" });
      return;
    }

    // Update the applicant
    await db
      .update(usersTable)
      .set(filteredUpdateData)
      .where(eq(usersTable.id, userId));

    res.status(200).json({
      message: "Application updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}
