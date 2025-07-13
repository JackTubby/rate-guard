import { NextFunction, Request, Response } from "express";
import { RateLimiterOptions } from "./types";

export function createRateLimiter(options: RateLimiterOptions) {
  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    next();
  };
}
