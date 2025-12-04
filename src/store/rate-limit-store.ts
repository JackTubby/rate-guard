import { RateLimitState, Store } from "../../types/types";

export class RateLimitStore {
  constructor(
    private store: Store,
    private ttl: number
  ) {}

  async get(key: string): Promise<RateLimitState | null> {
    return this.store.get(key);
  }

  async save(key: string, state: RateLimitState): Promise<void> {
    await this.store.set(key, state, this.ttl);
  }

  createState(tokens: number): RateLimitState {
    return {
      tokens,
      windowMs: Date.now(),
      formattedWindowMs: new Date().toISOString(),
    };
  }
}
