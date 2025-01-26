import express from "express";
import type { Response, Request, NextFunction } from "express";
const router = express.Router();
import "dotenv/config";
import {
  getAllApplicants,
  approveApplicant,
  denyApplicant,
} from "../handlers/applicantHandler.js";

router.post("/getAllApplicants", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  await getAllApplicants(token, res);
});
router.post("/approveApplicant/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const id = req.params.id;
  const interests: [] = req.body.interests;
  await approveApplicant(token, interests, id, res);
});

router.post("/denyApplicant/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const id = req.params.id;
  await denyApplicant(token, id, res);
});
export default router;
