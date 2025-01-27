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
