import BucketLimiter from "./limiters.ts/bucket";

class RateLimiterFactory {
  static create(algorithm: string, options: any, store: any) {
    switch (algorithm) {
      case "tokenBucket":
        return new BucketLimiter(options, store);
      default:
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }
  }
}

export default RateLimiterFactory