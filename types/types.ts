export type StoreTypes = "redis" | "memory";

export type RateLimiterOptions =
  | {
      type: 'tokenBucket';          // REQUIRED - the type of algo to use
      storeType: StoreTypes;        // REQUIRED - type of storage to use
      store?: Store | null;         // OPTIONAL - handles store instance for redis
      timeFrame?: number;           // OPTIONAL - window length
      tokenLimit?: number;          // OPTIONAL - allowed tokens within the window
      keyGenerator?: (req: unknown) => string | Promise<string>;  // OPTIONAL - function to generate a custom key
      message?: unknown;            // OPTIONAL - an OPTIONAL message to return to users who exceed limit
      ttl?: number;                 // OPTIONAL - data set time to live
    }
  | {
      type: 'fixedWindow';          // REQUIRED - the type of algo to use
      storeType: StoreTypes;        // REQUIRED - type of storage to use
      store: RedisClient;           // REQUIRED - handles store instance for redis
      timeFrame?: number;           // OPTIONAL - window length
      tokenLimit?: number;          // OPTIONAL - allowed tokens within the window
      keyGenerator?: (req: unknown) => string | Promise<string>;  // OPTIONAL - function to generate a custom key
      message?: unknown;            // OPTIONAL - an OPTIONAL message to return to users who exceed limit
      ttl?: number;                 // OPTIONAL - data set time to live
    }
  | {
      type: 'slidingWindow';
      storeType: StoreTypes;
      store: RedisClient;
      timeFrame?: number;
      keyGenerator?: (req: unknown) => string | Promise<string>
      message?: unknown;
      ttl?: number;
    };

export interface RateLimitState {
  tokens: number;
  windowMs: number;
  formattedWindowMs: string;
}

export interface SlidingWindowEvent {
  score: number;
  value: string;
}

export interface Store {
  get(key: string): Promise<RateLimitState | null>;
  set(key: string, value: RateLimitState, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { PX: number }): Promise<string | null>;
  unlink(key: string): Promise<number>;
  zAdd(key: string, members: SlidingWindowEvent | SlidingWindowEvent[]): Promise<number>;
  zRange(key: string, start: number | string, stop: number | string): Promise<string[]>;
  zRemRangeByScore(key: string, min: number | string, max: number | string): Promise<number>;
  zCard(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

export interface TokenBucketOptions {
  tokenLimit: number;
  timeFrame: number;
}

export interface RateLimitResult {
  success: boolean;
  message: string;
  tokensRemaining?: number | null;
  tokensLimit?: number | null;
  tokensReset?: number | null;
}

export interface FixedWindowOptions {
  tokenLimit: number;
  timeFrame: number;
}