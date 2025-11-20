import { BucketState } from "../../types/types";

class CustomRedisStore {
  redis: any;
  constructor(redisInstance: any) {
    this.redis = redisInstance;
    console.log("Redis instance value: ", redisInstance)
  }

  async get(key: string) {
    console.log("redis - get");
    const item = await this.redis.get(key);
    console.log("returned item from redis: ", item)
    if (!item) return null;
    try {
      return JSON.parse(item) || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async set(key: string, state: BucketState) {
    console.log("redis - set");
    try {
      await this.redis.set(key, JSON.stringify(state));
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async delete(key: string) {
    console.log("redis - delete");
    try {
      await this.redis.unlink(key);
    } catch (err) {
      console.log(err)
      return null
    }
  }
}

export default CustomRedisStore;
