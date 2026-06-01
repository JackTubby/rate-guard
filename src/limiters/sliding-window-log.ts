import { RateLimitResult } from "../../types/types";
import { SlidingWindowStore } from "../store/sliding-window-store";

export class SlidingWindowLogLimiter {
    constructor (
        private store: SlidingWindowStore,
        private options: any,
    ) {
    }

    async checkLimit (key: string): Promise<RateLimitResult> {
        const timestamps = await this.store.get(key)
        console.log("timestamps: ", timestamps)

        if (!timestamps) {
            // handle that none exist so create one
            console.log("No timestamps")
            const save = await this.store.save(key, Date.now())
            console.log("SAVE: ", save)
        }

        // we have checked if this user had no timestamps e.g. does not exist
        // we must if the user exists:
        // remove all old timestamps
        const now = Date.now();

        // WE NEED TO RUN THIS A LOG WHAT THE STORE RETURNS AND THEN WE KNOW WHAT
        // TO HANDLE

        // count the remaining
        // If at limit or over fail if less add one and pass



        return {
        success: true,
        message: "Token granted",
        tokensRemaining: 1,
        tokensLimit: this.options.tokenLimit,
        tokensReset: this.options.timeFrame,
        };
    }
}