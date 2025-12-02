import MemoryStore from "../store/memory";
import CustomRedisStore from "../store/redis";
import { BucketState, RateLimiterOptions, StoreTypes } from "../../types/types";

class FixedWindowLimiter {
  key: string | null;
  timeFrame: number;
  windowMs!: number;
  store: any;
  tokenLimit: number;
  bucketStore: BucketState;
  usersBucket: any;

  constructor(options: RateLimiterOptions) {
    this.timeFrame = options.timeFrame || 900000; // milliseconds (15 mins)
    options.storeType === "memory"
      ? (this.store = new MemoryStore())
      : (this.store = new CustomRedisStore(options.store));
    this.tokenLimit = options.tokenLimit || 50;
    this.bucketStore = {
      tokens: 0,
      windowMs: 0,
      formattedWindowMs: "",
    };
    this.key = "";
  }

  public async checkLimit(key: string) {
    this.key = key;
    this.usersBucket = await this.store.get(key);

    if (!this.usersBucket) {
      const res = await this.handleBucketNotExisting();
      if (res) {
        return { success: true, message: "Bucket created and token granted" };
      }
      return { success: false, message: "Failed to create bucket" };
    } else {
      // bucket exists -
      await this.handleBucketRefill();

      if (this.usersBucket.tokens === 0) {
        return { success: false, message: "No tokens left" };
      } else {
        const res = await this.handleBucketExisting();
        if (res) {
          return { success: true, message: "Bucket created and token granted" };
        }
        return { success: false, message: "Failed to create bucket" };
      }
    }
  }

  private async handleBucketRefill() {
    this.windowMs = this.usersBucket.windowMs;
    const now = new Date().getTime();
    const timePassed = now - this.windowMs;
    if (timePassed >= this.timeFrame) {
      this.usersBucket.tokens = this.tokenLimit;
      this.usersBucket.windowMs = now;
      this.usersBucket.formattedWindowMs = new Date().toISOString(),
      await this.store.set(this.key, this.usersBucket);
    }
  }

  private async handleBucketExisting() {
    this.bucketStore = {
      tokens: this.usersBucket.tokens - 1,
      windowMs: this.usersBucket.windowMs,
      formattedWindowMs: this.usersBucket.formattedWindowMs,
    };
    await this.store.set(this.key, this.bucketStore);
    return true;
  }

  private async handleBucketNotExisting() {
    const now = new Date().getTime();
    this.bucketStore = {
      tokens: this.tokenLimit - 1,
      windowMs: now,
      formattedWindowMs: new Date().toISOString(),
    };
    try {
      await this.store.set(this.key, this.bucketStore);
    } catch (err) {
      return false;
    }
    return true;
  }
}

export default FixedWindowLimiter;
