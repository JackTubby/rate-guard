import { RateLimitResult } from "../../types/types";
import { RateLimitStore } from "../store/rate-limit-store";

class SlidingWindowLogLimiter {
    constructor (
        private store: RateLimitStore,
        private options: any,
    ) {
    }

    async checkLimit (key: string): Promise<RateLimitResult> {

    return {
      success: true,
      message: "Token granted",
      tokensRemaining: bucket.tokens,
      tokensLimit: this.options.tokenLimit,
      tokensReset: this.options.timeFrame,
    };
    }
}