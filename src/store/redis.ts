import { BucketState } from '../types'

interface Store {
  get(key: string): Promise<BucketState | null>
  set(key: string, state: BucketState): Promise<void>
  delete(key: string): Promise<void>
  getAll(): Promise<Map<string, BucketState>>
}

class RedisStore implements Store {
  private client: any

  constructor(client: any) {
    this.client = client
  }

  async get(key: string): Promise<BucketState | null> {
    const result = await this.client.hGetAll(key)
    console.log('Redis GET:', key, result)

    if (!result || Object.keys(result).length === 0) {
      return null
    }

    return {
      tokens: Number(result.tokens),
      lastRefill: Number(result.lastRefill),
      formattedLastRefill: result.formattedLastRefill,
    } as BucketState
  }

  async set(key: string, state: BucketState): Promise<void> {
    console.log('Redis SET:', key, state)
    await this.client.hSet(key, {
      ...state,
    })
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key)
  }

  async getAll(): Promise<Map<string, BucketState>> {
    const keys = await this.client.keys('*')
    const results = await Promise.all(keys.map((key: any) => this.get(key)))
    return new Map(results.filter((result): result is [string, BucketState] => result !== null))
  }
}

export default RedisStore
