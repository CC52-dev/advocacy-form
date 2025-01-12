

import type { Response, Request, NextFunction } from "express";
import { CustomError } from "../lib/custom-error.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  console.log("Not found", req.url);
  return next(new CustomError("Route not found", 404));
}

