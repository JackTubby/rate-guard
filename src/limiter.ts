import BucketLimiter from './limiters.ts/bucket'
import MemoryStore from './store/memory'
import RedisStore from './store/redis'
import { RateLimiterOptions, StoreType } from './types'

class RateLimiterFactory {
  static create(algorithm: string, options: RateLimiterOptions, storeType: StoreType) {
    let store: any
    switch (storeType) {
      case 'memory':
        store = new MemoryStore()
        break
      case 'redis':
        store = new RedisStore()
        break
      default:
        throw new Error(`Unknown store type: ${storeType}`)
    }

    switch (algorithm) {
      case 'tokenBucket':
        return new BucketLimiter(options, store)
      default:
        throw new Error(`Unknown algorithm: ${algorithm}`)
    }
  }
}

export default RateLimiterFactory
