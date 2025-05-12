import db from "../db/db.js";
import { eq, and } from "drizzle-orm";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { sessionTable, usersTable, otpTable } from "../db/schema.js";
import type { User, Session, Otp } from "../db/schema.js";
import {
  createSession,
  generateSessionToken,
  validateSessionToken,
  invalidateSession,
} from "../lib/session.js";
import type { SessionValidationResult } from "../lib/session.js";
import type { Response } from "express";

export async function authenticate(email: string, res: Response) {
  try {
    const user: User = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user[0]) {
      res.status(400).json({
        message: "User not found",
      });
      return;
    }
    const otp: Otp[] = await db
      .select()
      .from(otpTable)
      .where(eq(otpTable.email, email));
    if (otp.length > 0) {
      const createdAt = new Date(otp[0].createdAt);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - createdAt.getTime();
      const minutesDifference = timeDifference / (1000 * 60);

      if (minutesDifference > 30) {
        await db.delete(otpTable).where(eq(otpTable.id, otp[0].id));
      } else {
        res.status(200).json({
          message: otp[0].otp,
        });
        return;
      }
    }
    const newOtp = await db
      .insert(otpTable)
      .values({
        email: user[0].email,
        userId: user[0].id,
      });
    
    const insertedOtp = await db
      .select()
      .from(otpTable)
      .where(eq(otpTable.email, user[0].email))
      .limit(1);
      
    res.status(200).json({
      message: insertedOtp[0].otp,
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
    });
  }
}

export async function verifyOTP(
  email: string,
  incomingOtp: string,
  res: Response
) {
  try {
    const otp: Otp[] = await db
      .select()
      .from(otpTable)
      .where(and(eq(otpTable.email, email), eq(otpTable.otp, incomingOtp)));
    if (otp.length > 0) {
      const createdAt = new Date(otp[0].createdAt);
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - createdAt.getTime();
      const minutesDifference = timeDifference / (1000 * 60);
      if (minutesDifference > 30) {
        await db.delete(otpTable).where(eq(otpTable.id, otp[0].id));
        res.status(400).json({
          message: "OTP expired",
        });
        return;
      }
      await db.delete(otpTable).where(eq(otpTable.id, otp[0].id));
      const token = generateSessionToken();
      const user: User = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));
      const { expiresAt } = await createSession(token, user[0].id);

      res
        .cookie("session_token", token, {
          expires: expiresAt,
          secure: true,
          sameSite: 'none',
          httpOnly: true
        })
        .status(200)
        .json({
          message: "OTP verified",
          token: token,
        });
      console.log({ message: token });
      return;
    }
    res.status(400).json({
      message: "OTP not found",
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
    });
  }
}

export async function resendOTP(email: string, res: Response) {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (user.length === 0) {
      res.status(400).json({
        message: "User not found",
      });
      return;
    }

    // Delete any existing OTP for this user
    await db.delete(otpTable).where(eq(otpTable.email, email));

    // Create new OTP
    const newOtp = await db
      .insert(otpTable)
      .values({
        email: user[0].email,
        userId: user[0].id,
      });
    
    const insertedOtp = await db
      .select()
      .from(otpTable)
      .where(eq(otpTable.email, user[0].email))
      .limit(1);
      
    res.status(200).json({
      message: insertedOtp[0].otp,
    });
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
    });
  }
}
