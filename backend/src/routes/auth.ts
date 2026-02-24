import express from "express";
import type { Response, Request } from "express";
const router = express.Router();
import db from "../db/db.js";
import { eq } from "drizzle-orm";
import { authenticate, verifyOTP, resendOTP } from "../handlers/authHandler.js";
import { validateSessionToken, invalidateSession } from "../lib/session.js";
import { getSessionToken } from "../lib/getSessionToken.js";
import { applicationSessionsTable } from "../db/schema.js";
import "dotenv/config";


router.post("/login/:email", async (req: Request, res: Response) => {
  const email: string = req.params.email;
  await authenticate(email, res);
});

router.post("/verify/otp", async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const otp: string = req.body.otp;
  await verifyOTP(email, otp, res);
});

router.post("/verify/otp/resend/:email", async (req: Request, res: Response) => {
  const email: string = req.params.email;
  await resendOTP(email, res);
});

router.post("/logout", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  if (!token) {
    res.status(200).json({ message: "No session to logout" });
    return;
  }

  const sessionValidationResult = await validateSessionToken(token);
  if (sessionValidationResult.session) {
    // Invalidate the main session
    await invalidateSession(sessionValidationResult.session.id);
    
    // Also invalidate all application sessions created by this user session
    await db
      .delete(applicationSessionsTable)
      .where(eq(applicationSessionsTable.userSessionId, sessionValidationResult.session.id));
    
    console.log(`Logged out user and invalidated all application sessions for session ${sessionValidationResult.session.id}`);
  }

  res.clearCookie("session_token").status(200).json({ message: "Logged out successfully" });
});

export default router;
