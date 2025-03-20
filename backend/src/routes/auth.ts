import express from "express";
import type { Response, Request, NextFunction } from "express";
const router = express.Router();
import { z } from "zod";
import db from "../db/db.js";
import { eq } from "drizzle-orm";
import { authenticate, verifyOTP, resendOTP } from "../handlers/authHandler.js";
import "dotenv/config";


router.post("/login/:email", async (req: Request, res: Response) => {
  const email: string = req.params.email;
  await authenticate(email, res);
  // res.status(200).json({ message: message});
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

export default router;
