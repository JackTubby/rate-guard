export interface RateLimiterOptions {
  store?: BucketState | null; // store - optional - handles store instance for redis
  cleanupInterval?: number; // cleanupInterval - optional - clean up interval timing
  enableCleanup?: boolean; // enableCleanup - optional - allow clean up operation
  timeFrame?: number; // timeFrame - optional - window length
  tokenLimit?: number; // tokenLimit - optional - allowed tokens within the window
  value?: string; // value - optional - value to use as the key optional as defaults to ip
  message?: any; // message - optional - an optional message to return to users who exceed limit
  storeType: StoreTypes; // storeType - required - type of storage to use
  type: string; // type - required - the type of algo to use
}

type StoreTypes = 'redis' | 'memory';

export interface BucketState {
  tokens: number;
  lastRefill: number;
  formattedLastRefill: string;
}
