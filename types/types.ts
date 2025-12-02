export type RateLimiterOptions =
  | {
      storeType: "memory";          // REQUIRED - type of storage to use
      store?: Store | null;   // OPTIONAL - handles store instance for redis
      timeFrame?: number;           // OPTIONAL - window length
      tokenLimit?: number;          // OPTIONAL - allowed tokens within the window
      value?: string;               // OPTIONAL - value to use as the key optional as defaults to ip
      message?: unknown;            // OPTIONAL - an OPTIONAL message to return to users who exceed limit
      type: string;                 // REQUIRED - the type of algo to use
    }
  | {
      storeType: "redis";           // REQUIRED - type of storage to use
      store: RedisClient;           // REQUIRED - handles store instance for redis
      timeFrame?: number;           // OPTIONAL - window length
      tokenLimit?: number;          // OPTIONAL - allowed tokens within the window
      value?: string;               // OPTIONAL - value to use as the key optional as defaults to ip
      message?: unknown;            // OPTIONAL - an OPTIONAL message to return to users who exceed limit
      type: string;                 // REQUIRED - the type of algo to use
    };


export type StoreTypes = "redis" | "memory";

export interface BucketState {
  tokens: number;
  windowMs: number;
  formattedWindowMs: string;
}

export interface Store {
  get(key: string): Promise<BucketState | null>;
  set(key: string, state: BucketState): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  unlink(key: string): Promise<void>;
}
