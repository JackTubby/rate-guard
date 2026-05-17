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
    async save(key: string, event: SlidingWindowEvent): Promise<void> {
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

    private buildEvent(event: SlidingWindowEvent): any {
        if (!event.score || !event.value) {
            throw new Error('Missing score or value from event')
        }
        return {
          score: event.score,
          value: event.value,
        }
    } 
}

// TODO: TTL LIVES ON REDIS INSTANCE