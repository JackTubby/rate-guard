export interface RateLimiterOptions {
  store?: BucketState | null
  storeType?: StoreType
  redisClient?: any
  cleanupInterval?: number
  enableCleanup?: boolean
  timeFrame?: number
  tokenLimit?: number
  ipAddress?: string
  status?: number
  message?: any
}

export interface BucketState {
  tokens: number
  lastRefill: number
  formattedLastRefill: string
}

export type StoreType = 'memory' | 'redis'
