import { NextFunction, Request, Response } from "express";
import { RateLimiterOptions, StoreType } from "./types";
import MemoryStore from "./store/memory";
import CleanUp from "./cleanup";
import RateLimiterFactory from "./limiter";

export function createRateLimiter(options: RateLimiterOptions) {
  const store: StoreType = options.storeType || 'memory';
  const limiter = RateLimiterFactory.create("tokenBucket", options, store); // Todo: default tokenBucket but can choose algo of choice
  if (options.enableCleanup !== false) {
    startPeriodicCleanup(store, options.cleanupInterval);
  }

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
