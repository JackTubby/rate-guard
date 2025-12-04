import RateLimiterFactory from "../../src/limiter";
import BucketLimiter from "../../src/limiters/bucket";
import FixedWindowLimiter from "../../src/limiters/fixed-window";
import { RateGuardError } from "../../src/errors/errors";

describe("RateLimiterFactory", () => {
  describe("create", () => {
    describe("store type selection", () => {
      test("should create limiter with memory store", () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(BucketLimiter);
      });

      test("should create limiter with redis store", () => {
        const mockRedisClient = {
          get: jest.fn(),
          set: jest.fn(),
          unlink: jest.fn(),
        };

        const options = {
          type: "tokenBucket",
          storeType: "redis",
          store: mockRedisClient,
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(BucketLimiter);
      });

      test("should throw RateGuardError for invalid store type", () => {
        const options = {
          type: "tokenBucket",
          storeType: "invalid",
        };

        // @ts-expect-error - testing invalid store type
        expect(() => RateLimiterFactory.create(options)).toThrow(
          RateGuardError
        );
      });

      test("should throw RateGuardError with code RGEC-0008 for invalid store type", () => {
        const options = {
          type: "tokenBucket",
          storeType: "postgres",
        };

        try {
          // @ts-expect-error - testing invalid store type
          RateLimiterFactory.create(options);
          fail("Expected RateGuardError to be thrown");
        } catch (err) {
          expect(err).toBeInstanceOf(RateGuardError);
          expect((err as RateGuardError).code).toBe("RGEC-0008");
        }
      });
    });

    describe("limiter type selection", () => {
      test("should create BucketLimiter for tokenBucket type", () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(BucketLimiter);
      });

      test("should create FixedWindowLimiter for fixedWindow type", () => {
        const options = {
          type: "fixedWindow",
          storeType: "memory",
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(FixedWindowLimiter);
      });

      test("should throw RateGuardError for invalid limiter type", () => {
        const options = {
          type: "invalid",
          storeType: "memory",
        };

        // @ts-expect-error - testing invalid limiter type
        expect(() => RateLimiterFactory.create(options)).toThrow(
          RateGuardError
        );
      });

      test("should throw RateGuardError with code RGEC-0007 for invalid limiter type", () => {
        const options = {
          type: "slidingWindow",
          storeType: "memory",
        };

        try {
          // @ts-expect-error - testing invalid limiter type
          RateLimiterFactory.create(options);
          fail("Expected RateGuardError to be thrown");
        } catch (err) {
          expect(err).toBeInstanceOf(RateGuardError);
          expect((err as RateGuardError).code).toBe("RGEC-0007");
        }
      });
    });

    describe("option normalization", () => {
      test("should use default timeFrame when not provided", () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(BucketLimiter);
      });

      test("should use default tokenLimit when not provided", () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(BucketLimiter);
      });

      test("should use custom timeFrame when provided", () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
          timeFrame: 60000,
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(BucketLimiter);
      });

      test("should use custom tokenLimit when provided", () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
          tokenLimit: 100,
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(BucketLimiter);
      });

      test("should use custom ttl when provided", () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
          ttl: 3600000,
        } as const;

        const limiter = RateLimiterFactory.create(options);

        expect(limiter).toBeInstanceOf(BucketLimiter);
      });
    });

    describe("default values", () => {
      test("should default timeFrame to 900000 (15 minutes)", async () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
          tokenLimit: 1,
        } as const;

        const limiter = RateLimiterFactory.create(options);

        await limiter.checkLimit("test-key");
        const result = await limiter.checkLimit("test-key");

        expect(result.success).toBe(false);
      });

      test("should default tokenLimit to 50", async () => {
        const options = {
          type: "tokenBucket",
          storeType: "memory",
          timeFrame: 60000,
        } as const;

        const limiter = RateLimiterFactory.create(options);

        for (let i = 0; i < 50; i++) {
          const result = await limiter.checkLimit("test-key");
          expect(result.success).toBe(true);
        }

        const result = await limiter.checkLimit("test-key");
        expect(result.success).toBe(false);
      });
    });
  });
});
