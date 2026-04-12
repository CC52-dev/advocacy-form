import express from "express";
import type { Response, Request } from "express";
import { getSessionToken } from "../lib/getSessionToken.js";
import { getDashboardStats } from "../handlers/statsHandler.js";

const router = express.Router();

router.post("/dashboard", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await getDashboardStats(token, res);
});

export default router;
