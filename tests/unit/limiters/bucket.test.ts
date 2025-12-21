import TokenBucketLimiter from "../../../src/limiters/bucket";
import { RateLimitStore } from "../../../src/store/rate-limit-store";
import { RateLimitState } from "../../../types/types";

const createMockStore = () => {
  let storage: Record<string, RateLimitState> = {};

  return {
    store: {} as any,
    ttl: 86400000,
    get: jest.fn(async (key: string) => storage[key] ?? null),
    save: jest.fn(async (key: string, state: RateLimitState) => {
      storage[key] = state;
    }),
    createState: jest.fn(
      (tokens: number): RateLimitState => ({
        tokens,
        windowMs: Date.now(),
        formattedWindowMs: new Date().toISOString(),
      })
    ),
    _reset: () => {
      storage = {};
    },
  };
};

const asRateLimitStore = (mock: ReturnType<typeof createMockStore>) =>
  mock as unknown as RateLimitStore;

describe("TokenBucketLimiter", () => {
  let mockStore: ReturnType<typeof createMockStore>;
  let limiter: TokenBucketLimiter;

  beforeEach(() => {
    mockStore = createMockStore();
    jest.clearAllMocks();
  });

  describe("checkLimit", () => {
    test("should create new bucket on first request", async () => {
      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 10,
        timeFrame: 10000,
      });

      const result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Window created and token granted");
      expect(mockStore.createState).toHaveBeenCalledWith(9);
      expect(mockStore.save).toHaveBeenCalled();
    });

    test("should grant token when tokens available", async () => {
      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 10,
        timeFrame: 10000,
      });

      await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      const result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Token granted");
    });

    test("should reject when no tokens available", async () => {
      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 2,
        timeFrame: 60000,
      });

      await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      const result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Rate limit exceeded");
    });

    test("should exhaust all tokens correctly", async () => {
      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 5,
        timeFrame: 60000,
      });

      for (let i = 0; i < 5; i++) {
        const result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");
        expect(result.success).toBe(true);
      }

      const result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      expect(result.success).toBe(false);
    });

    test("should not save state when rate limited", async () => {
      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 1,
        timeFrame: 60000,
      });

      await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      mockStore.save.mockClear();

      await limiter.checkLimit("rateGuard:tokenBucket:test-key");

      expect(mockStore.save).not.toHaveBeenCalled();
    });

    test("should handle separate keys independently", async () => {
      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 1,
        timeFrame: 60000,
      });

      await limiter.checkLimit("user-1");
      await limiter.checkLimit("user-2");

      const result1 = await limiter.checkLimit("user-1");
      const result2 = await limiter.checkLimit("user-2");

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });

  describe("refill", () => {
    test("should refill tokens after time passes", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 10,
        timeFrame: 10000,
      });

      await limiter.checkLimit("rateGuard:tokenBucket:test-key");

      for (let i = 0; i < 9; i++) {
        await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      }

      let result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      expect(result.success).toBe(false);

      jest.spyOn(Date, "now").mockReturnValue(now + 5000);

      for (let i = 0; i < 5; i++) {
        result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");
        expect(result.success).toBe(true);
      }

      result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      expect(result.success).toBe(false);

      jest.restoreAllMocks();
    });

    test("should not refill when insufficient time passed", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 10,
        timeFrame: 10000,
      });

      for (let i = 0; i < 10; i++) {
        await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      }

      jest.spyOn(Date, "now").mockReturnValue(now + 500);

      const result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      expect(result.success).toBe(false);

      jest.restoreAllMocks();
    });

    test("should cap refill at tokenLimit", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 5,
        timeFrame: 5000,
      });

      await limiter.checkLimit("rateGuard:tokenBucket:test-key");

      jest.spyOn(Date, "now").mockReturnValue(now + 10000);

      for (let i = 0; i < 5; i++) {
        const result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");
        expect(result.success).toBe(true);
      }

      const result = await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      expect(result.success).toBe(false);

      jest.restoreAllMocks();
    });

    test("should advance windowMs correctly on refill", async () => {
      const now = 1000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      mockStore.createState = jest.fn((tokens: number) => ({
        tokens,
        windowMs: now,
        formattedWindowMs: new Date(now).toISOString(),
      }));

      limiter = new TokenBucketLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 10,
        timeFrame: 10000,
      });

      for (let i = 0; i < 10; i++) {
        await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      }

      jest.spyOn(Date, "now").mockReturnValue(now + 3500);

      await limiter.checkLimit("rateGuard:tokenBucket:test-key");

      const savedState = mockStore.save.mock.calls.slice(
        -1
      )[0][1] as RateLimitState;
      expect(savedState.windowMs).toBe(now + 3000);

      jest.restoreAllMocks();
    });

    test("should accumulate partial refills correctly", async () => {
      const now = 1000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      mockStore.createState = jest.fn((tokens: number) => ({
        tokens,
        windowMs: now,
        formattedWindowMs: new Date(now).toISOString(),
      }));

      limiter = new TokenBucketLimiter(asRateLimitStore(mockStore), {
        tokenLimit: 10,
        timeFrame: 10000,
      });

      for (let i = 0; i < 5; i++) {
        await limiter.checkLimit("rateGuard:tokenBucket:test-key");
      }

      jest.spyOn(Date, "now").mockReturnValue(now + 2500);

      await limiter.checkLimit("rateGuard:tokenBucket:test-key");

      const savedState = mockStore.save.mock.calls.slice(
        -1
      )[0][1] as RateLimitState;
      expect(savedState.windowMs).toBe(now + 2000);
      expect(savedState.tokens).toBe(6);

      jest.restoreAllMocks();
    });
  });
});
