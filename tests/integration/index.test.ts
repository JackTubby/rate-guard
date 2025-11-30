import RateLimiter from "../../src/limiter"
import MemoryStore from "../../src/store/memory"

describe("RateLimiter", () => {
	let options = {
		tokenLimit: 60,
		timeFrame: 3600000,
	}
	const ipAddress = "192.0.2.0"
	let store: any
	let limiter: any

	beforeEach(() => {
		store = new MemoryStore()
		limiter = new RateLimiter(options, store)
	})
	describe("CheckLimit", () => {
		it("should be a function", () => {
			const result = typeof limiter.checkLimit === "function"
			expect(result).toBe(true)
		})

		// we need to update responses from functions to follow a better pattern
		// so we can get better details so like a boolean if success or not
		// and error responses etc..
		it("should create a new bucket", async () => {
			const result = await limiter.checkLimit(ipAddress)
			expect(result).toMatchObject({
				success: true,
				message: "Bucket created and token granted",
			})
		})

		it("should grant a token from an exisitng bucket", async () => {
			await limiter.checkLimit(ipAddress)
			const result = await limiter.checkLimit(ipAddress)
			expect(result).toMatchObject({
				success: true,
				message: "Token granted",
			})
		})

		it("should not grant a token when bucket is empty", async () => {
			for (let i = 0; i < options.tokenLimit; i++) {
				await limiter.checkLimit(ipAddress)
			}
			const result = await limiter.checkLimit(ipAddress)
			expect(result).toMatchObject({
				success: false,
				message: "No tokens left",
			})
		})
	})

	describe("token refill over time", () => {
		beforeEach(() => {
			jest.useFakeTimers()
		})

		afterEach(() => {
			jest.useRealTimers()
		})

		it("should refill tokens over time", async () => {
			await limiter.checkLimit(ipAddress)
			const initialBucket = await store.get(ipAddress)
			expect(initialBucket.tokens).toBe(options.tokenLimit - 1)

			jest.advanceTimersByTime(options.timeFrame / 2)

			await limiter.checkLimit(ipAddress)

			const updatedBucket = await store.get(ipAddress)
			expect(updatedBucket.tokens).toBeGreaterThan(initialBucket.tokens - 1)
		})
	})
})
