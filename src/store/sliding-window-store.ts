import { SlidingWindowEvent } from "../../types/types";

export class SlidingWindowStore {
    constructor (
        private store: any,
    ) {}

    /**
     * Get from the store using the key
     * @param key 
     * @returns 
     */
    async get(key: string): Promise<SlidingWindowEvent | null> {
        return this.store.zRange(key)
    }

    /**
     * Save to the store using the key
     * @param key 
     * @param event 
    */
   // Todo: this any should match an incoming event whatever that looks like as we build event in the methods
    async save(key: string, timestamp: any): Promise<void> { 
        const chcekedEvent = this.buildEvent(event)
        await this.store.zAdd(key, chcekedEvent)
    }

    /**
     * Delete from the store less or equal to score
     * @param key 
     * @param score 
     */
    async delete(key: string, score: number): Promise<void> {
        await this.store.zRemRangeByScore(key, '-inf', score)
    }

    // Todo: this any should match an incoming event whatever that looks like as we build event in the methods
    private buildEvent(event: any): any {
        if (!event.timestamp || !event.key) {
            throw new Error('Missing score or value from event')
        }
        return {
          score: event.timestamp,
          value: event.key,
        }
    }
}

// TODO: TTL LIVES ON REDIS INSTANCE