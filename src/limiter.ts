import BucketLimiter from "./limiters/bucket";
import FixedWindowLimiter from "./limiters/fixed-window";
import { RateLimiterOptions } from "../types/types";
import { RateGuardError } from "./errors/errors";
import CustomRedisStore from "./store/redis";
import MemoryStore from "./store/memory";

class RateLimiterFactory {
  static create(options: RateLimiterOptions) {
    const normalisedOptions = RateLimiterFactory.normalizeOptions(options)

    let storeInstance;
    if (normalisedOptions.storeType === "redis") {
      storeInstance = new CustomRedisStore(normalisedOptions.store)
    } else if (normalisedOptions.storeType === "memory") {
      storeInstance = new MemoryStore()
    }
 
   switch (options.type) {
      case "tokenBucket":
        return new BucketLimiter(normalisedOptions, storeInstance);
      case "fixedWindow":
        return new FixedWindowLimiter(normalisedOptions, storeInstance)
      default:
        throw new RateGuardError('RGEC-0007', `${normalisedOptions.type}`);
    }
  }

  private static normalizeOptions (options: RateLimiterOptions) {
    return {
      timeFrame: options?.timeFrame && 900000,
      tokenLimit: options?.tokenLimit &&  50,
      ttl: options?.ttl &&  86400000,
      ...options
    }
  }
}

export default RateLimiterFactory