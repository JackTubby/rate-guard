import BucketLimiter from "./limiters/bucket";
import FixedWindowLimiter from "./limiters/fixed-window";
import { RateLimiterOptions } from "../types/types";
import { RateGuardError } from "./errors/errors";
import CustomRedisStore from "./store/redis";
import MemoryStore from "./store/memory";
import { RateLimitStore } from "./store/rate-limit-store";

class RateLimiterFactory {
  static create(options: RateLimiterOptions) {
    const normalisedOptions = RateLimiterFactory.normalizeOptions(options);

    let store;
    switch (normalisedOptions.storeType) {
      case "redis":
        store = new CustomRedisStore(normalisedOptions.store);
        break;
      case "memory":
        store = new MemoryStore();
        break;
      default:
        throw new RateGuardError(
          "RGEC-0008",
          `${(normalisedOptions as any).storeType}`
        );
    }

    const rateLimitStore = new RateLimitStore(store, normalisedOptions.ttl);

    const limiterOptions = {
      tokenLimit: normalisedOptions.tokenLimit,
      timeFrame: normalisedOptions.timeFrame,
    };

    switch (options.type) {
      case "tokenBucket":
        return new BucketLimiter(rateLimitStore, limiterOptions);
      case "fixedWindow":
        return new FixedWindowLimiter(rateLimitStore, limiterOptions);
      default:
        throw new RateGuardError(
          "RGEC-0007",
          `${normalisedOptions.type}`
        );
    }
  }

  private static normalizeOptions(options: RateLimiterOptions) {
    return {
      timeFrame: options?.timeFrame ?? 900000,
      tokenLimit: options?.tokenLimit ?? 50,
      ttl: options?.ttl ?? 86400000,
      ...options,
    };
  }
}

export default RateLimiterFactory;
