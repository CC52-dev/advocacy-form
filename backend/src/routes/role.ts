import express from "express";
import type { Response, Request } from "express";
const router = express.Router();
import "dotenv/config";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getUserRoles,
  assignRolesToUser,
} from "../handlers/roleHandler.js";

router.post("/getAllRoles", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  await getAllRoles(token, res);
});

router.post("/createRole", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const roleData = req.body;
  await createRole(token, roleData, res);
});

router.post("/updateRole/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const roleId = req.params.id;
  const roleData = req.body;
  await updateRole(token, roleId, roleData, res);
});

router.post("/deleteRole/:id", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const roleId = req.params.id;
  await deleteRole(token, roleId, res);
});

router.post("/getUserRoles/:userId", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const userId = req.params.userId;
  await getUserRoles(token, userId, res);
});

router.post("/assignRoles/:userId", async (req: Request, res: Response) => {
  const token = req.headers.cookie?.split("session_token=")[1]?.split(";")[0];
  const userId = req.params.userId;
  const { roles } = req.body; // Changed from roleIds to roles (array of {roleTitle, permissions})
  await assignRolesToUser(token, userId, roles, res);
});

export default router;
