import BucketLimiter from "./limiters.ts/bucket";
import { RateLimiterOptions } from "./types";

class RateLimiterFactory {
  static create(algorithm: string, options: RateLimiterOptions, store: any) {
    switch (algorithm) {
      case "tokenBucket":
        return new BucketLimiter(options, store);
      default:
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }
  }
}

export default RateLimiterFactory