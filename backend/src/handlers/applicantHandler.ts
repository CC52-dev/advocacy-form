import db from "../db/db.js";
import { eq, and } from "drizzle-orm";

import { usersTable, userRolesTable } from "../db/schema.js";
import type { User } from "../db/schema.js";
import { validateSessionToken, invalidateSession, invalidateAllUserSessions } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";
import { emailService } from "../lib/emailService.js";
import { hasPermission } from "../lib/permissions.js";

export async function getAllApplicants(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult =
      await validateSessionToken(token);
    if (
      !sessionValidationResult.session ||
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has applicants.read permission
    if (!(await hasPermission(userId, "applicants.read"))) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    const applicants = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.type, "applicant"));
    
    res.status(200).json({
      message: applicants || [],
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
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has applicants.approve permission (which requires applicants.read)
    if (!(await hasPermission(userId, "applicants.approve"))) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Get applicant details before updating
    const applicant = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!applicant[0]) {
      res.status(404).json({ message: "Applicant not found" });
      return;
    }

    if (applicant[0].type !== "applicant") {
      res.status(400).json({ message: "User is not an applicant" });
      return;
    }

    // Remove "Applicant" role (exclusive permission removal)
    // Find and remove any role with "applicant" permission
    const userRoles = await db
      .select()
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, id));

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
    
    for (const userRole of userRoles) {
      const permissions = parsePermissions(userRole.permissions);
      if (permissions.includes("applicant")) {
        await db.delete(userRolesTable).where(eq(userRolesTable.id, userRole.id));
      }
    }

    // Update user type and set accepted date
    await db
      .update(usersTable)
      .set({ type: "user", interest: interests, acceptedAt: new Date() })
      .where(eq(usersTable.id, id));

    // Do NOT assign default roles (user has no roles but can still log in and do basic things)
    // Admin can assign roles later if needed

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
      !sessionValidationResult.user
    ) {
      res.status(401).json({ message: "Token is Invalid Or Expired" });
      return;
    }

    const userId = sessionValidationResult.user.id;

    // Check if user has applicants.reject permission (which requires applicants.read)
    if (!(await hasPermission(userId, "applicants.reject"))) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    // Get applicant details before updating
    const applicant = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!applicant[0]) {
      res.status(404).json({ message: "Applicant not found" });
      return;
    }

    // Assign "Disabled" role (exclusive permission, removes all other roles)
    // Remove all existing roles first
    await db.delete(userRolesTable).where(eq(userRolesTable.userId, id));
    
    // Assign Disabled role with disabled permission
    const disabledPermissions = ["disabled"]; // Already an array
    
    await db.insert(userRolesTable).values({
      userId: id,
      roleTitle: "Disabled",
      permissions: disabledPermissions,
    } as any);

    // Update user type to disabled
    await db
      .update(usersTable)
      .set({ type: "disabled" })
      .where(eq(usersTable.id, id));

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
