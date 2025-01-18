import { type Response, type Request, type NextFunction, response } from "express";

export function request(req: Request, res: Response, next: NextFunction) {
    const time = new Date().toISOString();
      console.log("Request", {
        url: req.url as string,
        method: req.method as string,
        ip: req.ip as string,
        userAgent: req.headers['user-agent'] as string,
        timestamp: time as string,
        query: req.query as Record<string, string>,
        body: req.body as unknown,
        response: {
          status: res.statusCode,
        }
      });
    next();}