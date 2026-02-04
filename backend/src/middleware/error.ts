import  type { Request, Response, NextFunction } from "express";
import  type { CustomError } from "../lib/custom-error.js";

export function error(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const msg = JSON.parse(err.message);
    res.status(err.statusCode).json({ msg });
  } catch (error) {
    res.status(err.statusCode).json({ message: err.message });
  }
}