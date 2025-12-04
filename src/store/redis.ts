import { Store, BucketState, RedisClient } from "../../types/types";

class CustomRedisStore implements Store {
  private redis: RedisClient;

  constructor(redisInstance: RedisClient) {
    this.redis = redisInstance;
  }

  async get(key: string): Promise<BucketState | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as BucketState;
    } catch (err) {
      console.error("Failed to parse Redis value:", err);
      return null;
    }
  }

  async set(key: string, state: BucketState, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, JSON.stringify(state), {
        PX: ttl,
      });
    } else {
      await this.redis.set(key, JSON.stringify(state));
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.unlink(key);
  }
}

export default CustomRedisStore;
