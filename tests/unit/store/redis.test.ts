import CustomRedisStore from "../../../src/store/redis";
import { RateLimitState, RedisClient } from "../../../types/types";

const createMockRedisClient = () => {
  let storage: Record<string, string> = {};

  return {
    get: jest.fn(async (key: string) => storage[key] ?? null),
    set: jest.fn(async (key: string, value: string) => {
      storage[key] = value;
    }),
    unlink: jest.fn(async (key: string) => {
      delete storage[key];
    }),
    _reset: () => {
      storage = {};
    },
  };
};

describe("CustomRedisStore", () => {
  let mockRedis: ReturnType<typeof createMockRedisClient>;
  let store: CustomRedisStore;

  beforeEach(() => {
    mockRedis = createMockRedisClient();
    store = new CustomRedisStore(mockRedis);
    jest.clearAllMocks();
  });

  describe("get", () => {
    test("should return null when key does not exist", async () => {
      const result = await store.get("nonexistent");

      expect(result).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledWith("nonexistent");
    });

    test("should return parsed state when key exists", async () => {
      const state: RateLimitState = {
        tokens: 5,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      mockRedis.get.mockResolvedValueOnce(JSON.stringify(state));

      const result = await store.get("test-key");

      expect(result).toEqual(state);
    });

    test("should return null when JSON parsing fails", async () => {
      mockRedis.get.mockResolvedValueOnce("invalid json {{{");

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await store.get("test-key");

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("set", () => {
    test("should set value without TTL", async () => {
      const state: RateLimitState = {
        tokens: 5,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      await store.set("test-key", state);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(state)
      );
    });

    test("should set value with TTL when provided", async () => {
      const state: RateLimitState = {
        tokens: 5,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      await store.set("test-key", state, 60000);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(state),
        { PX: 60000 }
      );
    });

    test("should not include PX option when ttl is 0", async () => {
      const state: RateLimitState = {
        tokens: 5,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      await store.set("test-key", state, 0);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(state)
      );
    });
  });

  describe("delete", () => {
    test("should call unlink with correct key", async () => {
      await store.delete("test-key");

      expect(mockRedis.unlink).toHaveBeenCalledWith("test-key");
    });
  });
});
