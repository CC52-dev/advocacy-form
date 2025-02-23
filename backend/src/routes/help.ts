import express from "express";
import type { Response, Request, NextFunction } from "express";
const router = express.Router();
import "dotenv/config";
import { getUser, getAllUsers } from "../handlers/userHandler.js";

router.post("/all", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split('session_token=')[1]?.split(';')[0];
  await getUser(token, res);;

})

router.post("/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split('session_token=')[1]?.split(';')[0];
  await getAllUsers(token, res);
})
export default router;
