import express from "express";
import type { Response, Request } from "express";
const router = express.Router();
import "dotenv/config";
import { getSessionToken } from "../lib/getSessionToken.js";
import {
  getAllApplicants,
  approveApplicant,
  denyApplicant,
  updateApplicantSelf,
} from "../handlers/applicantHandler.js";

router.post("/getAllApplicants", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await getAllApplicants(token, res);
});
router.post("/approveApplicant/:id", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  const id = req.params.id;
  const interests: [] = req.body.interests;
  await approveApplicant(token, interests, id, res);
});

router.post("/denyApplicant/:id", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  const id = req.params.id;
  await denyApplicant(token, id, res);
});

router.post("/updateApplication", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  const updateData = req.body;
  await updateApplicantSelf(token, updateData, res);
});

export default router;
