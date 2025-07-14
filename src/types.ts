export interface RateLimiterOptions {
  ipAddress?: string;
  timeFrame?: number;
  store?: BucketState | null;
  status?: number;
  message?: any;
}

export interface BucketState {
  tokens: number;
  lastRefill: number;
}
