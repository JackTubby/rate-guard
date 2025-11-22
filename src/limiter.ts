import BucketLimiter from "./limiters.ts/bucket";
import { RateLimiterOptions } from "../types/types";

class RateLimiterFactory {
  static create(algorithm: string, options: RateLimiterOptions, storeType: any) {
    switch (algorithm) {
      case "tokenBucket":
        return new BucketLimiter(options, storeType);
      default:
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }
  }
}

export default RateLimiterFactory