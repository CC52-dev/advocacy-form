import type { Response, Request, NextFunction } from "express";

export function request(req: Request, res: Response, next: NextFunction) {
    const time = new Date().toISOString();
    console.log("Request", req.url, req.ip, time);
  next();
}