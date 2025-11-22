export interface RateLimiterOptions {
  store?: BucketState | null;
  cleanupInterval?: number;
  enableCleanup?: boolean;
  timeFrame?: number;
  tokenLimit?: number;
  value: string;
  status?: number;
  message?: any;
  storeType: string;
  type: string;
}

export interface BucketState {
  tokens: number;
  lastRefill: number;
  formattedLastRefill: string;
}
