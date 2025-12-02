import { Store, BucketState } from "../../types/types";

class MemoryStore implements Store {
  private buckets = new Map<string, BucketState>();

  async get(key: string): Promise<BucketState | null> {
    return this.buckets.get(key) ?? null;
  }

  async set(key: string, state: BucketState): Promise<void> {
    this.buckets.set(key, state);
  }

  async delete(key: string): Promise<void> {
    this.buckets.delete(key);
  }
}

export default MemoryStore;
