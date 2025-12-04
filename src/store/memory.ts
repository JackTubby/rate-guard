import { Store, RateLimitState } from "../../types/types";

class MemoryStore implements Store {
  private buckets = new Map<string, RateLimitState>();

  async get(key: string): Promise<RateLimitState | null> {
    return this.buckets.get(key) ?? null;
  }

  async set(key: string, state: RateLimitState): Promise<void> {
    this.buckets.set(key, state);
  }

  async delete(key: string): Promise<void> {
    this.buckets.delete(key);
  }
}

export default MemoryStore;
