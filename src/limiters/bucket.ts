import MemoryStore from "../store/memory";
import CustomRedisStore from "../store/redis";
import { BucketState } from "../../types/types";

class BucketLimiter {
  key: string | null;
  timeFrame: number;
  windowMs!: number;
  store: any;
  tokenLimit: number;
  bucketStore: BucketState;
  usersBucket: any;

  constructor(options: any, storeType: any) {
    this.timeFrame = options.timeFrame || 900000; // milliseconds (15 mins)
    if (storeType === "memory") {
      this.store = new MemoryStore();
    } else if (storeType === "redis") {
      this.store = new CustomRedisStore(options.store);
    }
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

    // if le bucket does not exist
    if (!this.usersBucket) {
      const res = await this.handleBucketNotExisting();
      if (res) {
        return { success: true, message: "Bucket created and token granted" };
      }
      return { success: false, message: "Failed to create bucket" };
    }
    // if le bucket does exist
    else {
      await this.handleBucketRefill();

      if (this.usersBucket.tokens === 0) {
        return { success: false, message: "No tokens left" };
      } else {
        const res = await this.handleBucketExisting();
        if (res) {
          return { success: true, message: "Token granted" };
        }
        return { success: false, message: "Failed to update bucket" };
      }
    }
  }

  private async handleBucketRefill() {
    this.windowMs = this.usersBucket.windowMs;
    const now = new Date().getTime();
    const timePassed = now - this.windowMs;
    const refillRate = this.tokenLimit / this.timeFrame;
    const tokensToAdd = Math.floor(timePassed * refillRate);
    const currentTokens = this.usersBucket.tokens;
    const tokensActuallyAdded = Math.min(
      tokensToAdd,
      this.tokenLimit - currentTokens
    );
    const timeConsumed = tokensActuallyAdded / refillRate;
    const isOverspill = currentTokens + tokensToAdd > this.tokenLimit;

    this.bucketStore = {
      tokens: isOverspill ? this.tokenLimit : currentTokens + tokensToAdd,
      windowMs: now,
      formattedWindowMs: new Date().toISOString(),
    };
    await this.store.set(this.key, this.bucketStore);
    this.usersBucket = {
      ...this.usersBucket,
      tokens: isOverspill ? this.tokenLimit : currentTokens + tokensToAdd,
    };
  }

  private async handleBucketNotExisting() {
    const now = new Date().getTime();
    this.bucketStore = {
      tokens: this.tokenLimit - 1,
      windowMs: now,
      formattedWindowMs: new Date().toISOString(),
    };
    await this.store.set(this.key, this.bucketStore);
    return true;
  }

  private async handleBucketExisting() {
    this.bucketStore = {
      tokens: this.usersBucket.tokens - 1,
      windowMs: this.bucketStore.windowMs,
      formattedWindowMs: new Date().toISOString(),
    };
    await this.store.set(this.key, this.bucketStore);
    return true;
  }
}

export default BucketLimiter;
