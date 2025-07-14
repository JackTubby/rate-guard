import { BucketState } from "./types";

class RateLimiter {
  ipAddress: string | null;
  timeFrame: number;
  lastRefill!: number;
  store: any;
  tokenLimit: number;
  bucketStore: BucketState;
  usersBucket: any;

  constructor(options: any, store: any) {
    this.timeFrame = options.timeFrame || 900000; // milliseconds (15 mins)
    this.store = store;
    this.tokenLimit = options.tokenLimit || 50;
    this.bucketStore = {
      tokens: 0,
      lastRefill: 0,
    };
    this.ipAddress = "";
  }

  public async checkLimit(ipAddress: string) {
    this.ipAddress = ipAddress;
    this.usersBucket = await this.store.get(ipAddress);
    console.log("Bucket: ", this.usersBucket);
    // if le bucket does not exist
    if (!this.usersBucket) {
      const res = await this.handleBucketNotExisting();
      return res;
    }
    // if le bucket does exist
    else {
      await this.handleBucketRefill();
      if (this.usersBucket.tokens === 0) {
        const res = await this.handleNoTokensLeft();
        return res;
      } else {
        const res = await this.handleBucketExisting();
        return res;
      }
    }
  }

  public async handleBucketRefill() {
    this.lastRefill = this.usersBucket.lastRefill;
    const now = new Date().getTime();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(
      (timePassed / this.timeFrame) * this.tokenLimit
    );
    const currentTokens = this.usersBucket.tokens;
    const isOverspill =
      currentTokens + tokensToAdd > this.tokenLimit ? true : false;
    this.bucketStore = {
      tokens: isOverspill ? this.tokenLimit : currentTokens + tokensToAdd,
      lastRefill: new Date().getTime(),
    };
    await this.store.set(this.ipAddress, this.bucketStore);
    this.usersBucket = {
      ...this.usersBucket,
      tokens: isOverspill ? this.tokenLimit : currentTokens + tokensToAdd,
    };
    console.log("bucket after refill: ", this.usersBucket);
  }

  private async handleBucketNotExisting() {
    this.bucketStore = {
      tokens: this.tokenLimit - 1,
      lastRefill: new Date().getTime(),
    };
    await this.store.set(this.ipAddress, this.bucketStore);
    return true;
  }

  private async handleBucketExisting() {
    this.bucketStore = {
      tokens: this.usersBucket.tokens - 1,
      lastRefill: new Date().getTime(),
    };
    await this.store.set(this.ipAddress, this.bucketStore);
    return true;
  }

  private async handleNoTokensLeft() {
    console.log("Bucket has no tokens left");
    this.bucketStore = {
      tokens: 0,
      lastRefill: new Date().getTime(),
    };
    await this.store.set(this.ipAddress, this.bucketStore);
    return false;
  }
}

export default RateLimiter;
