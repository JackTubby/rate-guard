import {
  RateLimitState,
  FixedWindowOptions,
  RateLimitResult,
} from "../../types/types";
import { RateLimitStore } from "../store/rate-limit-store";

class FixedWindowLimiter {
  constructor(
    private bucketStore: RateLimitStore,
    private options: FixedWindowOptions
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

    const decremented: RateLimitState = {
      ...refilled,
      tokens: refilled.tokens - 1,
    };
    await this.bucketStore.save(key, decremented);
    return { success: true, message: "Token granted" };
  }

  private refill(bucket: RateLimitState): RateLimitState {
    const { tokenLimit, timeFrame } = this.options;
    const now = Date.now();
    const timePassed = now - bucket.windowMs;

    if (timePassed >= timeFrame) {
      const windowsElapsed = Math.floor(timePassed / timeFrame);
      const newWindowMs = bucket.windowMs + windowsElapsed * timeFrame;

      return {
        tokens: tokenLimit,
        windowMs: newWindowMs,
        formattedWindowMs: new Date(newWindowMs).toISOString(),
      };
    }

    return bucket;
  }
}

export default FixedWindowLimiter;
