import { RateLimitState, TokenBucketOptions, RateLimitResult } from "../../types/types";
import { RateLimitStore } from "../store/rate-limit-store";

class TokenBucketLimiter {
  constructor(
    private bucketStore: RateLimitStore,
    private options: TokenBucketOptions
  ) {}

  async checkLimit(key: string): Promise<RateLimitResult> {
    const bucket = await this.bucketStore.get(key);

    if (!bucket) {
      const newState = this.bucketStore.createState(
        this.options.tokenLimit - 1
      );
      await this.bucketStore.save(key, newState);
      return { success: true, message: "Bucket created and token granted" };
    }

    const refilled = this.refill(bucket);

    if (refilled.tokens === 0) {
      return { success: false, message: "No tokens left" };
    }

    const decremented = this.bucketStore.createState(refilled.tokens - 1);
    await this.bucketStore.save(key, decremented);
    return { success: true, message: "Token granted" };
  }

  private refill(bucket: RateLimitState): RateLimitState {
    const { tokenLimit, timeFrame } = this.options;
    const now = Date.now();
    const timePassed = now - bucket.windowMs;
    const refillRate = tokenLimit / timeFrame;
    const tokensToAdd = Math.floor(timePassed * refillRate);
    const newTokens = Math.min(bucket.tokens + tokensToAdd, tokenLimit);

    return this.bucketStore.createState(newTokens);
  }
}

export default TokenBucketLimiter;
