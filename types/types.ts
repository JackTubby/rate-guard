export interface RateLimiterOptions {
  store?: BucketState | null;    // OPTIONAL - handles store instance for redis
  // cleanupInterval?: number;   // OPTIONAL - clean up interval timing
  // enableCleanup?: boolean;    // OPTIONAL - allow clean up operation
  timeFrame?: number;            // OPTIONAL - window length
  tokenLimit?: number;           // OPTIONAL - allowed tokens within the window
  value?: string;                // OPTIONAL - value to use as the key optional as defaults to ip
  message?: any;                 // OPTIONAL - an OPTIONAL message to return to users who exceed limit
  storeType: StoreTypes;         // REQUIRED - type of storage to use
  type: string;                  // REQUIRED - the type of algo to use
}

type StoreTypes = "redis" | "memory";

export interface BucketState {
  tokens: number;
  lastRefill: number;
  formattedLastRefill: string;
}
