import BucketLimiter from "./limiters/bucket";
import FixedWindowLimiter from "./limiters/fixed-window";
import { SlidingWindowLogLimiter } from "./limiters/sliding-window-log";
import { SlidingWindowStore } from "./store/sliding-window-store";
import { RateLimiterOptions } from "../types/types";
import { RateGuardError } from "./errors/errors";
import CustomRedisStore from "./store/redis";
import MemoryStore from "./store/memory";
import { RateLimitStore } from "./store/rate-limit-store";

class RateLimiterFactory {
  static create(options: RateLimiterOptions) {
    const normalisedOptions = RateLimiterFactory.normalizeOptions(options);

    const limiterOptions = {
      tokenLimit: normalisedOptions.tokenLimit,
      timeFrame: normalisedOptions.timeFrame,
    };

    if (options.type === "slidingWindow") {
      if (options.storeType !== "redis") {
        throw new RateGuardError("RGEC-0008", `${(options as any).storeType}`);
      }
      const slidingStore = new SlidingWindowStore(options.store);
      return new SlidingWindowLogLimiter(slidingStore, limiterOptions);
    }

    let store;
    switch (normalisedOptions.storeType) {
      case "redis":
        store = new CustomRedisStore(normalisedOptions.store, options.type);
        break;
      case "memory":
        store = new MemoryStore(options.type);
        break;
      default:
        throw new RateGuardError(
          "RGEC-0008",
          `${(normalisedOptions as any).storeType}`
        );
    }

    const rateLimitStore = new RateLimitStore(store, normalisedOptions.ttl);

    switch (options.type) {
      case "tokenBucket":
        return new BucketLimiter(rateLimitStore, limiterOptions);
      case "fixedWindow":
        return new FixedWindowLimiter(rateLimitStore, limiterOptions);
      default:
        throw new RateGuardError("RGEC-0007", `${normalisedOptions.type}`);
    }
  }

  private static normalizeOptions(options: RateLimiterOptions) {
    const timeFrame = options?.timeFrame ?? 900000;
    const tokenLimit = options?.tokenLimit ?? 50;

    return {
      ...options,
      timeFrame,
      tokenLimit,
      ttl: options?.ttl ?? timeFrame,
    };
  }
}

export default RateLimiterFactory;
