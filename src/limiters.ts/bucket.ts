import MemoryStore from "../store/memory";
import CustomRedisStore from "../store/redis";
import { BucketState } from "../types";

class BucketLimiter {
  ipAddress: string | null;
  timeFrame: number;
  lastRefill!: number;
  store: any;
  tokenLimit: number;
  bucketStore: BucketState;
  usersBucket: any;

  constructor(options: any, storeType: any) {
    this.timeFrame = options.timeFrame || 900000; // milliseconds (15 mins)
    if (storeType === "memory") {
      this.store = new MemoryStore();
    } else if (storeType === "redis") {
      console.log("Entering redis if...");
      this.store = new CustomRedisStore(options.store);
      console.log("Store initialised - ", this.store);
    }
    this.tokenLimit = options.tokenLimit || 50;
    this.bucketStore = {
      tokens: 0,
      lastRefill: 0,
      formattedLastRefill: "",
    };
    this.ipAddress = "";
  }

  public async checkLimit(ipAddress: string) {
    this.ipAddress = ipAddress;
    console.log("About to call get in checkLimit func");
    this.usersBucket = await this.store.get(ipAddress);

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
      // console.log("Before refill - Bucket:", this.usersBucket);
      await this.handleBucketRefill();
      // console.log("After refill - Bucket:", this.usersBucket);

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
    this.lastRefill = this.usersBucket.lastRefill;
    const now = new Date().getTime();
    const timePassed = now - this.lastRefill;
    const refillRate = this.tokenLimit / this.timeFrame;
    const tokensToAdd = Math.floor(timePassed * refillRate);
    const currentTokens = this.usersBucket.tokens;
    const tokensActuallyAdded = Math.min(
      tokensToAdd,
      this.tokenLimit - currentTokens
    );
    const timeConsumed = tokensActuallyAdded / refillRate;
    const isOverspill = currentTokens + tokensToAdd > this.tokenLimit;
    console.log("Refill calculation:", {
      tokensToAdd,
      tokensActuallyAdded,
      timeConsumed,
      oldLastRefill: this.lastRefill,
      newLastRefill: this.lastRefill + timeConsumed,
    });

    this.bucketStore = {
      tokens: isOverspill ? this.tokenLimit : currentTokens + tokensToAdd,
      lastRefill: now,
      formattedLastRefill: new Date().toISOString(),
    };
    await this.store.set(this.ipAddress, this.bucketStore);
    this.usersBucket = {
      ...this.usersBucket,
      tokens: isOverspill ? this.tokenLimit : currentTokens + tokensToAdd,
    };
  }

  private async handleBucketNotExisting() {
    const now = new Date().getTime();
    this.bucketStore = {
      tokens: this.tokenLimit - 1,
      lastRefill: now,
      formattedLastRefill: new Date().toISOString(),
    };
    await this.store.set(this.ipAddress, this.bucketStore);
    return true;
  }

  private async handleBucketExisting() {
    this.bucketStore = {
      tokens: this.usersBucket.tokens - 1,
      lastRefill: this.bucketStore.lastRefill,
      formattedLastRefill: new Date().toISOString(),
    };
    await this.store.set(this.ipAddress, this.bucketStore);
    return true;
  }
}

export default BucketLimiter;
