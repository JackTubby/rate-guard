import { NextFunction, Request, Response } from "express";
import { RateLimiterOptions } from "../types/types";
import RateLimiterFactory from "./limiter";
import { RateGuardError } from "./errors/errors";
import { criticalOptions, resolveRateLimitKey } from "./helpers/entry-helpers";

export function createRateLimiter(options: RateLimiterOptions) {
  const validateOptions = criticalOptions(options);
  if (validateOptions.length) {
    throw new RateGuardError("RGEC-0001", `${validateOptions.join(", ")}`);
  }

  const limiter = RateLimiterFactory.create(options);

  return async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const key = resolveRateLimitKey(options, req);

      const canProceed = await limiter.checkLimit(key);
      if (canProceed.success) {
        next();
      } else {
        return res
          .status(429)
          .json({ message: options?.message ?? "Too many requests" });
      }
    } catch (err) {
      if (err instanceof RateGuardError) {
        return res.status(500).json({
          code: err.code,
          name: err.name,
          message: err.message,
        });
      }
    }
  };
}

// async function startPeriodicCleanup(store: any, interval: number = 3600000) {
//   const cleanup = new CleanUp(store, interval);
//   cleanup.scheduleCleanup();
// }
