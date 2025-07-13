import { BucketState } from "../types";
interface Store {
  get(key: string): Promise<BucketState | null>;
  set(key: string, state: BucketState): Promise<void>;
}

class MemoryStore implements Store {
  private buckets = new Map<string, BucketState>();

  async get(key: string): Promise<BucketState | null> {
    return this.buckets.get(key) || null;
  }

  async set(key: string, state: BucketState): Promise<void> {
    this.buckets.set(key, state);
  }
}

export default MemoryStore;
