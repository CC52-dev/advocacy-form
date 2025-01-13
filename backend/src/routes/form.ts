import express from "express";
import type { Response, Request, NextFunction } from "express";
const router = express.Router();
import { z } from "zod";
import db from "../db/db.js";
import { applicantsTable, usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import "dotenv/config";
import { checkEmail } from "../lib/checkEmail.js";

const formSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z
    .string()
    .email("Invalid email address")
    .superRefine(async (val, ctx) => {
      if (val) {
        const response = await checkEmail(val);
        if (!response) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email is already being used, Sign in instead?",
          });
        }
      }
    }),
  location: z.array(z.string()).min(2, "Both country and state are required"),
  addr: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  interest: z.array(z.string()).min(1, "Please select at least one interest"),
  over16: z.boolean().refine((val) => val === true, {
    message: "You must be over 16 years old",
  }),
});

router.post("/checkemail/:user", async (req: Request, res: Response) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const email: string = req.params.user;
  const result = await checkEmail(email);
  if (result === true) {
    res.json({ result: true });
  } else if (result === "sign") {
    res.json({ result: "sign" });

  }else {
    res.json({ result: false });
  }
});

router.post("/new", async (req: Request, res: Response) => {
  const formdata: object = req.body;
  const parseResult = await formSchema.safeParseAsync(formdata);
  if (!parseResult.success) {
    res.json({ result: parseResult.error.issues });
    return;
  }

  await db.insert(applicantsTable).values(formdata);
  res.json({ result: true });
});
export default router;
