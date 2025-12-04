import MemoryStore from "../../../src/store/memory";
import { RateLimitState } from "../../../types/types";

describe("MemoryStore", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  describe("get", () => {
    test("should return null when key does not exist", async () => {
      const result = await store.get("nonexistent");

      expect(result).toBeNull();
    });

    test("should return state when key exists", async () => {
      const state: RateLimitState = {
        tokens: 5,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      await store.set("test-key", state);
      const result = await store.get("test-key");

      expect(result).toEqual(state);
    });
  });

  describe("set", () => {
    test("should store state correctly", async () => {
      const state: RateLimitState = {
        tokens: 10,
        windowMs: 2000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      await store.set("test-key", state);
      const result = await store.get("test-key");

      expect(result).toEqual(state);
    });

    test("should overwrite existing state", async () => {
      const state1: RateLimitState = {
        tokens: 10,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      const state2: RateLimitState = {
        tokens: 5,
        windowMs: 2000000,
        formattedWindowMs: "2025-01-02T00:00:00.000Z",
      };

      await store.set("test-key", state1);
      await store.set("test-key", state2);
      const result = await store.get("test-key");

      expect(result).toEqual(state2);
    });

    test("should handle multiple keys", async () => {
      const state1: RateLimitState = {
        tokens: 10,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      const state2: RateLimitState = {
        tokens: 5,
        windowMs: 2000000,
        formattedWindowMs: "2025-01-02T00:00:00.000Z",
      };

      await store.set("key-1", state1);
      await store.set("key-2", state2);

      expect(await store.get("key-1")).toEqual(state1);
      expect(await store.get("key-2")).toEqual(state2);
    });
  });

  describe("delete", () => {
    test("should remove existing key", async () => {
      const state: RateLimitState = {
        tokens: 5,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      await store.set("test-key", state);
      await store.delete("test-key");
      const result = await store.get("test-key");

      expect(result).toBeNull();
    });

    test("should not throw when deleting nonexistent key", async () => {
      await expect(store.delete("nonexistent")).resolves.not.toThrow();
    });

    test("should only delete specified key", async () => {
      const state1: RateLimitState = {
        tokens: 10,
        windowMs: 1000000,
        formattedWindowMs: "2025-01-01T00:00:00.000Z",
      };

      const state2: RateLimitState = {
        tokens: 5,
        windowMs: 2000000,
        formattedWindowMs: "2025-01-02T00:00:00.000Z",
      };

      await store.set("key-1", state1);
      await store.set("key-2", state2);
      await store.delete("key-1");

      expect(await store.get("key-1")).toBeNull();
      expect(await store.get("key-2")).toEqual(state2);
    });
  });
});
