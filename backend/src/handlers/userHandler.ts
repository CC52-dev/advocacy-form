import db from "../db/db.js";
import { eq, and } from "drizzle-orm";

import { usersTable } from "../db/schema.js";
import type { User } from "../db/schema.js";
import { validateSessionToken, invalidateSession } from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";

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
      .where(eq(usersTable.type, "user"));
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


export async function logout(token: string, res: Response) {
  try {
    const sessionValidationResult: SessionValidationResult = await validateSessionToken(token);
    if (!sessionValidationResult.session || !sessionValidationResult.user) {
      res.status(200).json({
        message: "Token is Invalid Or Expired",
      });
      return;
    }
    await invalidateSession(token);
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
    });
  }
}