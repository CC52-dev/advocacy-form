import { CustomError } from "../lib/custom-error.js";
export function notFound(req, res, next) {
    console.log("Not found", req.url);
    return next(new CustomError("Route not found", 404));
}
