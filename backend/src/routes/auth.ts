import express from "express";
import type { Response, Request, NextFunction } from "express";
const router = express.Router();
import { z } from "zod";
import db from "../db/db.js";
import { applicantsTable, usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate } from "../handlers/authHandler.js";
import "dotenv/config";


router.post("/login/:email", async (req: Request, res: Response) => {
  const email: string = req.params.email;
  const message = await authenticate(email, res);
  console.log(message);
  // res.status(200).json({ message: message});
});


export default router;
