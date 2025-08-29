import { BucketState } from '../types'
interface Store {
  get(key: string): Promise<BucketState | null>
  set(key: string, state: BucketState): Promise<void>
  delete(key: string): Promise<void>
  getAll(): Promise<Map<string, BucketState>>
}

class MemoryStore implements Store {
  private buckets = new Map<string, BucketState>()

  async get(key: string): Promise<BucketState | null> {
    console.log('Bucket: ', this.buckets.get(key))
    return this.buckets.get(key) || null
  }

  async set(key: string, state: BucketState): Promise<void> {
    this.buckets.set(key, state)
  }

  async delete(key: string) {
    this.buckets.delete(key)
  }

  async getAll(): Promise<any | null> {
    return this.buckets
  }
}

export default MemoryStore
