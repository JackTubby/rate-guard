import { BucketState } from "./types";

class RateLimiter {
  ipAddress: string;
  lastRefill: number;
  timeFrame: number;
  store: any;

  constructor(options: any, store: any) {
    this.ipAddress = options.ipAddress;
    this.timeFrame = options.timeFrame || 900;
    this.store = store;
  }

  public async checkLimit(ipAddress: string) {
    const tokenCount = await this.store.get(ipAddress);
    console.log(tokenCount);
    return true;
  }
}

export default RateLimiter;
