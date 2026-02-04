import express from "express";
import type { Response, Request } from "express";
const router = express.Router();
import "dotenv/config";
import {
  getAllApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  regenerateApiKey,
} from "../handlers/applicationHandler.js";
import {
  generateLaunchTokenHandler,
  verifyLaunchToken,
} from "../handlers/applicationLaunchHandler.js";

// Get all applications
router.post("/getAllApplications", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  await getAllApplications(token, res);
});

// Get a single application
router.post("/getApplication/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.id;
  await getApplication(token, applicationId, res);
});

// Create a new application
router.post("/createApplication", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationData = req.body;
  await createApplication(token, applicationData, res);
});

// Update an application
router.post("/updateApplication/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.id;
  const applicationData = req.body;
  await updateApplication(token, applicationId, applicationData, res);
});

// Delete an application
router.post("/deleteApplication/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.id;
  await deleteApplication(token, applicationId, res);
});

// Regenerate API key
router.post("/regenerateApiKey/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.id;
  await regenerateApiKey(token, applicationId, res);
});

// Generate launch token for application
router.post("/launch/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.id;
  await generateLaunchTokenHandler(token, applicationId, res);
});

// Verify launch token (called by external applications using API key)
router.post("/verify-launch", async (req: Request, res: Response) => {
  await verifyLaunchToken(req, res);
});

export default router;
