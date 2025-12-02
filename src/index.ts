import { NextFunction, Request, Response } from "express";
import { RateLimiterOptions } from "../types/types";
import CleanUp from "./cleanup";
import RateLimiterFactory from "./limiter";
import { RateGuardError } from "./errors/errors";
import { criticalOptions } from "./helpers/entry-helpers";

export function createRateLimiter(options: RateLimiterOptions) {
  const validateOptions = criticalOptions(options);
  if (validateOptions.length) {
    throw new RateGuardError("RGEC-0001", `${validateOptions.join(", ")}`);
  }

  const storeType = options.storeType || "memory";
  const algorithm = options.type;
  const limiter = RateLimiterFactory.create(algorithm, options, storeType);

  return async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let key = null;
      if (options.type !== "fixed-window") {
        key =
          req.headers["x-rate-guard-key"] ||
          req.ip ||
          req.connection.remoteAddress ||
          null;
        if (!key || typeof key != "string") {
          throw new RateGuardError(
            "RGEC-0006",
            "x-rate-guard-key was not passed and fallback solution of ip was missing from request"
          );
        }
      } else {
        key = "000";
      }

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
