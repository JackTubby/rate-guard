import FixedWindowLimiter from "../../../src/limiters/fixed-window";
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

type MockStore = ReturnType<typeof createMockStore>;

describe("FixedWindowLimiter", () => {
  let mockStore: ReturnType<typeof createMockStore>;
  let limiter: FixedWindowLimiter;

  beforeEach(() => {
    mockStore = createMockStore();
    jest.clearAllMocks();
  });

  describe("checkLimit", () => {
    test("should create new bucket on first request", async () => {
      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 10,
        timeFrame: 60000,
      });

      const result = await limiter.checkLimit("test-key");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Bucket created and token granted");
      expect(mockStore.createState).toHaveBeenCalledWith(9);
      expect(mockStore.save).toHaveBeenCalled();
    });

    test("should grant token when tokens available", async () => {
      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 10,
        timeFrame: 60000,
      });

      await limiter.checkLimit("test-key");
      const result = await limiter.checkLimit("test-key");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Token granted");
    });

    test("should reject when no tokens available", async () => {
      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 2,
        timeFrame: 60000,
      });

      await limiter.checkLimit("test-key");
      await limiter.checkLimit("test-key");
      const result = await limiter.checkLimit("test-key");

      expect(result.success).toBe(false);
      expect(result.message).toBe("No tokens left");
    });

    test("should exhaust all tokens correctly", async () => {
      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 5,
        timeFrame: 60000,
      });

      for (let i = 0; i < 5; i++) {
        const result = await limiter.checkLimit("test-key");
        expect(result.success).toBe(true);
      }

      const result = await limiter.checkLimit("test-key");
      expect(result.success).toBe(false);
    });

    test("should not save state when rate limited", async () => {
      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 1,
        timeFrame: 60000,
      });

      await limiter.checkLimit("test-key");
      mockStore.save.mockClear();

      await limiter.checkLimit("test-key");

      expect(mockStore.save).not.toHaveBeenCalled();
    });

    test("should handle separate keys independently", async () => {
      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
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

  describe("refill (window reset)", () => {
    test("should reset tokens when window expires", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 5,
        timeFrame: 10000,
      });

      for (let i = 0; i < 5; i++) {
        await limiter.checkLimit("test-key");
      }

      let result = await limiter.checkLimit("test-key");
      expect(result.success).toBe(false);

      jest.spyOn(Date, "now").mockReturnValue(now + 10001);

      for (let i = 0; i < 5; i++) {
        result = await limiter.checkLimit("test-key");
        expect(result.success).toBe(true);
      }

      result = await limiter.checkLimit("test-key");
      expect(result.success).toBe(false);

      jest.restoreAllMocks();
    });

    test("should not reset tokens before window expires", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 5,
        timeFrame: 10000,
      });

      // Exhaust all tokens
      for (let i = 0; i < 5; i++) {
        await limiter.checkLimit("test-key");
      }

      jest.spyOn(Date, "now").mockReturnValue(now + 9999);

      const result = await limiter.checkLimit("test-key");
      expect(result.success).toBe(false);

      jest.restoreAllMocks();
    });

    test("should align windowMs to window boundary on reset", async () => {
      const now = 1000000;
      jest.spyOn(Date, "now").mockReturnValue(now);

      mockStore.createState = jest.fn((tokens: number) => ({
        tokens,
        windowMs: now,
        formattedWindowMs: new Date(now).toISOString(),
      }));

      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 5,
        timeFrame: 10000,
      });

      // Exhaust all tokens
      for (let i = 0; i < 5; i++) {
        await limiter.checkLimit("test-key");
      }

      // Advance time by 25000ms (2.5 windows)
      jest.spyOn(Date, "now").mockReturnValue(now + 25000);

      await limiter.checkLimit("test-key");

      const savedState = mockStore.save.mock.calls.slice(
        -1
      )[0][1] as RateLimitState;
      expect(savedState.windowMs).toBe(now + 20000);

      jest.restoreAllMocks();
    });

    test("should reset to full tokenLimit on window expiry", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      limiter = new FixedWindowLimiter(mockStore as unknown as RateLimitStore, {
        tokenLimit: 10,
        timeFrame: 10000,
      });

      for (let i = 0; i < 3; i++) {
        await limiter.checkLimit("test-key");
      }

      jest.spyOn(Date, "now").mockReturnValue(now + 10001);

      for (let i = 0; i < 10; i++) {
        const result = await limiter.checkLimit("test-key");
        expect(result.success).toBe(true);
      }

      const result = await limiter.checkLimit("test-key");
      expect(result.success).toBe(false);

      jest.restoreAllMocks();
    });
  });
});
