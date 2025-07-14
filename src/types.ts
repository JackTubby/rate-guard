export interface RateLimiterOptions {
  ipAddress?: string;
  timeFrame?: number;
  store?: BucketState | null;
  status?: number;
  message?: any;
  enableCleanup?: boolean;
  cleanupInterval?: number;
}

export interface BucketState {
  tokens: number;
  lastRefill: number;
}
