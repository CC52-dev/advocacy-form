import express from "express";
import type { Response, Request } from "express";
const router = express.Router();
import "dotenv/config";
import {
  getApplicationUsers,
  assignApplicationRole,
  removeApplicationRole,
  getMyApplications,
  getUserApplicationRoles,
  getAccessibleApplications,
  searchUsersForApplication,
  updateUserTitle,
} from "../handlers/applicationRolesHandler.js";
import {
  generateLaunchTokenHandler,
  verifyLaunchToken,
} from "../handlers/applicationLaunchHandler.js";

// Get all users with roles in an application
router.post("/:appId/users", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.appId;
  await getApplicationUsers(token, applicationId, res);
});

// Assign a role to a user in an application
router.post("/:appId/assign", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.appId;
  const { userId, roleCode, title } = req.body;
  await assignApplicationRole(token, applicationId, userId, roleCode, title || null, res);
});

// Remove a role from a user in an application
router.post("/:appId/remove", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.appId;
  const { userId, roleCode } = req.body;
  await removeApplicationRole(token, applicationId, userId, roleCode, res);
});

// Search users for adding to application
router.post("/:appId/search-users", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.appId;
  const { query } = req.body;
  await searchUsersForApplication(token, applicationId, query || "", res);
});

// Update user's title in an application
router.post("/:appId/update-title", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.appId;
  const { userId, title } = req.body;
  await updateUserTitle(token, applicationId, userId, title || null, res);
});

// Get applications where current user is admin
router.post("/my-applications", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  await getMyApplications(token, res);
});

// Get applications user has access to (for launch)
router.post("/accessible", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  await getAccessibleApplications(token, res);
});

// Get all application roles for a specific user
router.post("/user/:userId/roles", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const targetUserId = req.params.userId;
  await getUserApplicationRoles(token, targetUserId, res);
});

// Generate launch token for an application
router.post("/launch/:appId/generate", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const applicationId = req.params.appId;
  await generateLaunchTokenHandler(token, applicationId, res);
});

// Verify launch token (called by external applications, uses API key auth)
router.post("/launch/verify", async (req: Request, res: Response) => {
  await verifyLaunchToken(req, res);
});

export default router;
