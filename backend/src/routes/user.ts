import express from "express";
import type { Response, Request } from "express";
const router = express.Router();
import "dotenv/config";
import { getSessionToken } from "../lib/getSessionToken.js";
import { getUser, getAllUsers, updateUser } from "../handlers/userHandler.js";

router.post("/getUser", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await getUser(token, res);
})

router.post("/getAllUsers", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await getAllUsers(token, res);
})

router.post("/updateUser/:id", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  const userId = req.params.id;
  const updateData = req.body;
  await updateUser(token, userId, updateData, res);
})

export default router;
