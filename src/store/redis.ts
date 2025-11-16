import { BucketState } from "../types";

class CustomRedisStore {
  redis: any;
  constructor(redisInstance: any) {
    this.redis = redisInstance;
  }

  async get(key: string) {
    console.log("redis - get");
    const item = this.redis.get(key);
    return JSON.parse(item);
  }

  async set(key: string, state: BucketState) {
    console.log("redis - set");
    this.redis.set(key, JSON.stringify(state));
  }

  async delete(key: string) {
    console.log("redis - delete");
    this.redis.unlink(key);
  }
}
