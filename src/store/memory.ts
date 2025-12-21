import { Store, RateLimitState } from "../../types/types";

class MemoryStore implements Store {
  private buckets = new Map<string, RateLimitState>();
  private keyTitle: string;
  private keyAlgo: string;

  constructor(algo: string) {
    this.keyTitle = "rateGuard";
    this.keyAlgo = algo;
  }

  async get(key: string): Promise<RateLimitState | null> {
    const bucket = this.buckets.get(`${this.keyTitle}:${this.keyAlgo}:${key}`);
    return bucket ?? null;
  }

  async set(key: string, state: RateLimitState): Promise<void> {
    this.buckets.set(`${this.keyTitle}:${this.keyAlgo}:${key}`, state);
  }

  async delete(key: string): Promise<void> {
    this.buckets.delete(`${this.keyTitle}:${this.keyAlgo}:${key}`);
  }
}

export default MemoryStore;
