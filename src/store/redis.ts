import { Store, RateLimitState, RedisClient } from "../../types/types";

class CustomRedisStore implements Store {
  private redis: RedisClient;
  private keyTitle: string;
  private keyAlgo: string;

  constructor(redisInstance: RedisClient, algo: string) {
    this.redis = redisInstance;
    this.keyTitle = "rateGuard";
    this.keyAlgo = algo;
  }

  async get(key: string): Promise<RateLimitState | null> {
    const raw = await this.redis.get(`${this.keyTitle}:${this.keyAlgo}:${key}`);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as RateLimitState;
    } catch (err) {
      console.error("Failed to parse Redis value:", err);
      return null;
    }
  }

  async set(key: string, state: RateLimitState, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(
        `${this.keyTitle}:${this.keyAlgo}:${key}`,
        JSON.stringify(state),
        {
          PX: ttl,
        }
      );
    } else {
      await this.redis.set(
        `${this.keyTitle}:${this.keyAlgo}:${key}`,
        JSON.stringify(state)
      );
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.unlink(`${this.keyTitle}:${this.keyAlgo}:${key}`);
  }
}

export default CustomRedisStore;
