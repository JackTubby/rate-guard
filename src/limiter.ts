import BucketLimiter from "./limiters/bucket";
import FixedWindowLimiter from "./limiters/fixed-window";
import { RateLimiterOptions } from "../types/types";
import { RateGuardError } from "./errors/errors";

class RateLimiterFactory {
  static create(algorithm: string, options: RateLimiterOptions) {
    switch (algorithm) {
      case "tokenBucket":
        return new BucketLimiter(options);
      case "fixedWindow":
        return new FixedWindowLimiter(options)
      default:
        throw new RateGuardError('RGEC-0007', `${algorithm}`);
    }
  }
}

export default RateLimiterFactory