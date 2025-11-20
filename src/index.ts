import { NextFunction, Request, Response } from "express";
import { RateLimiterOptions } from "../types/types";
import CleanUp from "./cleanup";
import RateLimiterFactory from "./limiter";
import { RateGuardError } from "./errors/errors";
import { criticalOptions } from "../helpers/entry-helpers";

export function createRateLimiter(options: RateLimiterOptions) {
  const validateOptions = criticalOptions(options)
  if (validateOptions.length) {
    throw new RateGuardError(
      "RGEC-0001",
      "Missing option",
      `Missing critical options: ${validateOptions.join(", ")}`,
      null
    )
  }

  const storeType = options.storeType || "memory"
  const algorithm = options.type
  const limiter = RateLimiterFactory.create(algorithm, options, storeType);
    
    return async function rateLimiter(
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      const key = req.ip || "";
      if (!key) {
        return next();
      }
    console.log("incoming ip address: ", key);

    const canProceed = await limiter.checkLimit(key);

    if (canProceed.success) {
      console.log("Next...");
      next();
    } else {
      console.log("Too many requests");
      return res.status(429).json({ message: "Too many requests" });
    }
  };
}

async function startPeriodicCleanup(store: any, interval: number = 3600000) {
  const cleanup = new CleanUp(store, interval);
  cleanup.scheduleCleanup();
}
