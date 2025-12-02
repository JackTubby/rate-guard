import MemoryStore from "../store/memory";
import CustomRedisStore from "../store/redis";
import { BucketState } from "../../types/types";

class FixedWindowLimiter {
  key: string | null;
  timeFrame: number;
  lastRefill!: number;
  store: any;
  tokenLimit: number;
  bucketStore: BucketState;
  usersBucket: any;

  constructor(options: any, storeType: any) {
    this.timeFrame = options.timeFrame || 900000; // milliseconds (15 mins)
    storeType === "memory"
      ? (this.store = new MemoryStore())
      : (this.store = new CustomRedisStore(options.store));
    this.tokenLimit = options.tokenLimit || 50;
    this.bucketStore = {
      tokens: 0,
      lastRefill: 0,
      formattedLastRefill: "",
    };
    this.key = "";
  }

  public async checkLimit(key: string) {
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
    this.lastRefill = this.usersBucket.lastRefill;
    const now = new Date().getTime();
    const timePassed = now - this.lastRefill;
    if (timePassed >= this.timeFrame) {
      this.usersBucket.tokens = this.tokenLimit;
    }
  }

  private async handleBucketExisting() {
    this.bucketStore = {
      tokens: this.usersBucket.tokens - 1,
      lastRefill: this.bucketStore.lastRefill,
      formattedLastRefill: new Date().toISOString(),
    };
    await this.store.set(this.key, this.bucketStore);
    return true;
  }

  private async handleBucketNotExisting() {
    const now = new Date().getTime();
    this.bucketStore = {
      tokens: this.tokenLimit - 1,
      lastRefill: now,
      formattedLastRefill: new Date().toISOString(),
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
