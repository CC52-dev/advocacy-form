import express from "express";
import type { Response, Request, NextFunction } from "express";
const router = express.Router();
import "dotenv/config";
import { getUser, getAllUsers, updateUser } from "../handlers/userHandler.js";

router.post("/getUser", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split('session_token=')[1]?.split(';')[0];
  await getUser(token, res);;

})

router.post("/getAllUsers", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split('session_token=')[1]?.split(';')[0];
  await getAllUsers(token, res);
})

router.post("/updateUser/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split('session_token=')[1]?.split(';')[0];
  const userId = req.params.id;
  const updateData = req.body;
  await updateUser(token, userId, updateData, res);
})

export default router;
