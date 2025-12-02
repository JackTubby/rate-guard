import BucketLimiter from "./limiters/bucket";
import FixedWindowLimiter from "./limiters/fixed-window";
import { RateLimiterOptions } from "../types/types";
import { RateGuardError } from "./errors/errors";

class RateLimiterFactory {
  static create(algorithm: string, options: RateLimiterOptions, storeType: any) {
    switch (algorithm) {
      case "tokenBucket":
        return new BucketLimiter(options, storeType);
      case "fixedWindow":
        return new FixedWindowLimiter(options, storeType)
      default:
        throw new RateGuardError('RGEC-0007', `${algorithm}`);
    }
  }
}

export default RateLimiterFactory