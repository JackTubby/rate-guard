import BucketLimiter from "./limiters.ts/bucket";
import { RateLimiterOptions } from "../types/types";
import { RateGuardError } from "./errors/errors";

class RateLimiterFactory {
  static create(algorithm: string, options: RateLimiterOptions, storeType: any) {
    switch (algorithm) {
      case "tokenBucket":
        return new BucketLimiter(options, storeType);
      default:
        throw new RateGuardError('RGEC-0007', `${algorithm}`);
    }
  }
}

export default RateLimiterFactory