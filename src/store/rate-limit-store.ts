import { BucketState } from "../../types/types";

interface Store {
  get(key: string): Promise<BucketState | null>;
  set(key: string, value: BucketState, ttl?: number): Promise<void>;
}

export class RateLimitStore {
  constructor(
    private store: Store,
    private ttl: number
  ) {}

  async get(key: string): Promise<BucketState | null> {
    return this.store.get(key);
  }

  async save(key: string, state: BucketState): Promise<void> {
    await this.store.set(key, state, this.ttl);
  }

  createState(tokens: number): BucketState {
    return {
      tokens,
      windowMs: Date.now(),
      formattedWindowMs: new Date().toISOString(),
    };
  }
}
