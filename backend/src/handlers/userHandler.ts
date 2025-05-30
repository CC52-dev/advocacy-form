import db from "../db/db.js";
import { eq, and, or, inArray } from "drizzle-orm";

import { usersTable } from "../db/schema.js";
import type { User } from "../db/schema.js";
import { validateSessionToken, invalidateSession, invalidateAllUserSessions } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";

// Define the update data type
type UserUpdateData = {
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  location?: any;
  addr?: string;
  city?: string;
  zip?: string;
  interest?: any;
  type?: "admin" | "user" | "applicant" | "disabled" | "adminviewer";
};

export async function getUser(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult = await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(200).json({
        message: "Token is Invalid Or Expired",
      });
      return;
    }
    
    res.status(200).json({
      message: sessionValidationResult.user,
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
    });
  }
}

export async function getAllUsers(token: string, res: Response) {
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
    
    // Get users, admins, adminviewers, and disabled users
    const users = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.type, ["user", "admin", "adminviewer", "disabled"]));
    
    if (users) {
      res.status(200).json({
        message: users,
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

export async function updateUser(
  token: string,
  userId: string,
  updateData: UserUpdateData,
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
      return;
    }

    // Get the user to be updated
    const userToUpdate = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!userToUpdate[0]) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    // Check if admin is trying to edit another admin
    if (userToUpdate[0].type === "admin") {
      res.status(403).json({ message: "Cannot edit other admin users" });
      return;
    }

    // Validate that admin can only edit disabled users and adminviewers
    if (userToUpdate[0].type !== "disabled" && userToUpdate[0].type !== "adminviewer" && userToUpdate[0].type !== "user") {
      res.status(403).json({ message: "Can only edit users, disabled users, and admin viewers" });
      return;
    }

    // Validate the new type if it's being changed
    if (updateData.type && !["user", "disabled", "adminviewer"].includes(updateData.type)) {
      res.status(400).json({ message: "Invalid user type. Can only set to: user, disabled, or adminviewer" });
      return;
    }

    // Prevent admin from disabling themselves
    if (updateData.type === "disabled" && sessionValidationResult.user && sessionValidationResult.user.id === userId) {
      res.status(403).json({ message: "Cannot disable your own account" });
      return;
    }

    // Update the user
    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, userId));

    // If user is being disabled, revoke all their sessions
    if (updateData.type === "disabled") {
      await invalidateAllUserSessions(userId);
    }

    res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "An error occurred" });
    console.error(error);
  }
}
