import express from "express";
import type { Response, Request, NextFunction } from "express";
const router = express.Router();
import { z } from "zod";
import db from "../db/db.js";
import { applicantsTable, usersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import "dotenv/config";
import { checkEmail } from "../lib/checkEmail.js";
import { handleNewForm } from "../handlers/formHandler.js";

router.post("/checkemail/:user", async (req: Request, res: Response) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const email: string = req.params.user;
  const result = await checkEmail(email);
  if (result === true) {
    res.json({ result: true });
  } else if (result === "sign") {
    res.json({ result: "sign" });
  } else {
    res.json({ result: false });
  }
});

router.post("/new", async (req: Request, res: Response) => {
  const formdata = req.body;
  const result = await handleNewForm(formdata);
  if (result.result === true) {
    res.status(200).send(result.result);
  } else {
    res.status(400).json(result.result);
  }
});
export default router;
