import {
  RateLimitState,
  FixedWindowOptions,
  RateLimitResult,
} from "../../types/types";
import { RateLimitStore } from "../store/rate-limit-store";

class FixedWindowLimiter {
  constructor(
    private store: RateLimitStore,
    private options: FixedWindowOptions
  ) {}

  async checkLimit(key: string): Promise<RateLimitResult> {
    const state = await this.store.get(key);

    if (!state) {
      // First request consumes a token
      const newState = this.store.createState(this.options.tokenLimit - 1);
      await this.store.save(key, newState);
      return {
        success: true,
        message: "Window created and token granted",
        tokensRemaining: this.options.tokenLimit - 1,
        tokensLimit: this.options.tokenLimit,
        tokensReset: this.options.timeFrame,
      };
    }

    const current = this.resetIfExpired(state);

    if (current.tokens === 0) {
      return {
        success: false,
        message: "No tokens left",
        tokensRemaining: state.tokens,
        tokensLimit: this.options.tokenLimit,
        tokensReset: this.options.timeFrame,
      };
    }

    const decremented: RateLimitState = {
      ...current,
      tokens: current.tokens - 1,
    };
    await this.store.save(key, decremented);
    return {
      success: true,
      message: "Token granted",
      tokensRemaining: state.tokens,
      tokensLimit: this.options.tokenLimit,
      tokensReset: this.options.timeFrame,
    };
  }

  private resetIfExpired(state: RateLimitState): RateLimitState {
    const { tokenLimit, timeFrame } = this.options;
    const now = Date.now();

    if (now - state.windowMs >= timeFrame) {
      return {
        tokens: tokenLimit,
        windowMs: now,
        formattedWindowMs: new Date(now).toISOString(),
      };
    }

    return state;
  }
}

export default FixedWindowLimiter;
