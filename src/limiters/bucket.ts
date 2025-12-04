import {
  RateLimitState,
  TokenBucketOptions,
  RateLimitResult,
} from "../../types/types";
import { RateLimitStore } from "../store/rate-limit-store";

class TokenBucketLimiter {
  private readonly msPerToken: number;

  constructor(
    private bucketStore: RateLimitStore,
    private options: TokenBucketOptions
  ) {
    this.msPerToken = options.timeFrame / options.tokenLimit;
  }

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

    if (refilled.tokens < 1) {
      return { success: false, message: "Rate limit exceeded" };
    }

    const decremented: RateLimitState = {
      ...refilled,
      tokens: refilled.tokens - 1,
    };
    await this.bucketStore.save(key, decremented);
    return { success: true, message: "Token granted" };
  }

  private refill(bucket: RateLimitState): RateLimitState {
    const { tokenLimit } = this.options;
    const now = Date.now();
    const timePassed = now - bucket.windowMs;

    const tokensToAdd = Math.floor(timePassed / this.msPerToken);

    if (tokensToAdd === 0) {
      return bucket;
    }

    const newTokens = Math.min(bucket.tokens + tokensToAdd, tokenLimit);

    const timeConsumed = tokensToAdd * this.msPerToken;
    const newWindowMs = bucket.windowMs + timeConsumed;

    return {
      tokens: newTokens,
      windowMs: newWindowMs,
      formattedWindowMs: new Date(newWindowMs).toISOString(),
    };
  }
}

export default TokenBucketLimiter;
