import express from "express";
import type { Response, Request } from "express";
const router = express.Router();
import "dotenv/config";
import { getSessionToken } from "../lib/getSessionToken.js";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp,
  getEventRsvps,
} from "../handlers/eventHandler.js";

router.post("/getAllEvents", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  const { search, myEvents } = req.body || {};
  await getAllEvents(token!, res, { search, myEvents });
});

router.post("/createEvent", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await createEvent(token!, req.body, res);
});

router.post("/updateEvent/:id", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await updateEvent(token!, req.params.id, req.body, res);
});

router.post("/deleteEvent/:id", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await deleteEvent(token!, req.params.id, res);
});

router.post("/rsvp/:eventId", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await rsvpEvent(token!, req.params.eventId, res);
});

router.post("/cancelRsvp/:eventId", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await cancelRsvp(token!, req.params.eventId, res);
});

router.post("/getEventRsvps/:eventId", async (req: Request, res: Response) => {
  const token = getSessionToken(req);
  await getEventRsvps(token!, req.params.eventId, res);
});

export default router;
