import { BucketState } from '../types'

class BucketLimiter {
  ipAddress: string | null
  timeFrame: number
  lastRefill!: number
  store: any
  tokenLimit: number
  bucketStore: BucketState
  usersBucket: any

  constructor(options: any, store: any) {
    this.timeFrame = options.timeFrame || 600000 // milliseconds (10 mins)
    this.store = store
    this.tokenLimit = options.tokenLimit || 100
    this.bucketStore = {
      tokens: 0,
      lastRefill: 0,
      formattedLastRefill: '',
    }
    this.ipAddress = ''
  }

  public async checkLimit(ipAddress: string) {
    this.ipAddress = ipAddress
    this.usersBucket = await this.store.get(ipAddress)

    // if le bucket does not exist
    if (!this.usersBucket) {
      const res = await this.handleBucketNotExisting()
      if (res) {
        return { success: true, message: 'Bucket created and token granted' }
      }
      return { success: false, message: 'Failed to create bucket' }
    }
    // if le bucket does exist
    else {
      console.log('Before refill - Bucket:', this.usersBucket)
      await this.handleBucketRefill()
      console.log('After refill - Bucket:', this.usersBucket)

      if (this.usersBucket.tokens === 0) {
        const res = await this.handleNoTokensLeft()
        if (res) {
          return { success: false, message: 'No tokens left' }
        }
        return { success: false, message: 'No tokens left' }
      } else {
        const res = await this.handleBucketExisting()
        if (res) {
          return { success: true, message: 'Token granted' }
        }
        return { success: false, message: 'Failed to update bucket' }
      }
    }
  }

  private async handleBucketRefill() {
    this.lastRefill = this.usersBucket.lastRefill
    const now = new Date().getTime()
    const timePassed = now - this.lastRefill
    const tokensToAdd = Math.floor((timePassed / this.timeFrame) * this.tokenLimit)
    const currentTokens = this.usersBucket.tokens
    const isOverspill = currentTokens + tokensToAdd > this.tokenLimit ? true : false
    this.bucketStore = {
      tokens: isOverspill ? this.tokenLimit : currentTokens + tokensToAdd,
      lastRefill: tokensToAdd > 0 ? new Date().getTime() : this.lastRefill,
      formattedLastRefill: new Date().toISOString(),
    }
    await this.store.set(this.ipAddress, this.bucketStore)
    this.usersBucket = {
      ...this.usersBucket,
      tokens: isOverspill ? this.tokenLimit : currentTokens + tokensToAdd,
    }
  }

  private async handleBucketNotExisting() {
    this.bucketStore = {
      tokens: this.tokenLimit - 1,
      lastRefill: new Date().getTime(),
      formattedLastRefill: new Date().toISOString(),
    }
    await this.store.set(this.ipAddress, this.bucketStore)
    return true
  }

  private async handleBucketExisting() {
    this.bucketStore = {
      tokens: this.usersBucket.tokens - 1,
      lastRefill: this.bucketStore.lastRefill,
      formattedLastRefill: new Date().toISOString(),
    }
    await this.store.set(this.ipAddress, this.bucketStore)
    return true
  }

  private async handleNoTokensLeft() {
    this.bucketStore = {
      tokens: 0,
      lastRefill: this.bucketStore.lastRefill,
      formattedLastRefill: new Date().toISOString(),
    }
    return false
  }
}

export default BucketLimiter
