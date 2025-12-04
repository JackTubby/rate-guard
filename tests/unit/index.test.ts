import { RateGuardError } from "../../src/errors/errors";
import {
  criticalOptions,
  resolveRateLimitKey,
} from "../../src/helpers/entry-helpers";
import { Request } from "express";

const mockRequest = (overrides = {}) =>
  ({
    headers: {},
    ip: "127.0.0.1",
    connection: { remoteAddress: "127.0.0.1" },
    ...overrides,
  }) as unknown as Request;

describe("criticalOptions", () => {
  test("should return empty array when all required options provided", () => {
    const options = {
      type: "tokenBucket",
      storeType: "memory",
    } as const;

    expect(criticalOptions(options)).toEqual([]);
  });

  test("should return missing 'type' when not provided", () => {
    const options = {
      storeType: "memory",
    } as const;

    // @ts-expect-error
    const result = criticalOptions(options);
    expect(result).toContain("type");
  });

  test("should return missing 'storeType' when not provided", () => {
    const options = {
      type: "tokenBucket",
    } as const;

    // @ts-expect-error
    const result = criticalOptions(options);
    expect(result).toContain("storeType");
  });

  test("should return both missing fields when neither provided", () => {
    // @ts-expect-error
    const result = criticalOptions({});
    expect(result).toContain("type");
    expect(result).toContain("storeType");
  });

  test("should return 'options missing' when options is null or undefined", () => {
    // @ts-expect-error
    expect(criticalOptions(null)).toEqual(["options missing"]);
    // @ts-expect-error
    expect(criticalOptions(undefined)).toEqual(["options missing"]);
  });
});

describe("resolveRateLimitKey", () => {
  describe("fixedWindow type", () => {
    test("should always return '000' for fixedWindow type", () => {
      const options = {
        type: "fixedWindow",
        storeType: "memory",
      } as const;

      const req = mockRequest({ ip: "192.168.1.1" });
      const key = resolveRateLimitKey(options, req);

      expect(key).toBe("000");
    });

    test("should return '000' regardless of headers for fixedWindow", () => {
      const options = {
        type: "fixedWindow",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        headers: { "x-rate-guard-key": "custom-key" },
      });
      const key = resolveRateLimitKey(options, req);

      expect(key).toBe("000");
    });
  });

  describe("tokenBucket type", () => {
    test("should use x-rate-guard-key header when present", () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        headers: { "x-rate-guard-key": "custom-key-123" },
      });
      const key = resolveRateLimitKey(options, req);

      expect(key).toBe("custom-key-123");
    });

    test("should use req.ip when no custom header present", () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({ ip: "192.168.1.1" });
      const key = resolveRateLimitKey(options, req);

      expect(key).toBe("192.168.1.1");
    });

    test("should fall back to connection.remoteAddress when ip not available", () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        ip: undefined,
        connection: { remoteAddress: "172.16.0.1" },
      });
      const key = resolveRateLimitKey(options, req);

      expect(key).toBe("172.16.0.1");
    });

    test("should prioritize x-rate-guard-key over req.ip", () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        ip: "192.168.1.1",
        headers: { "x-rate-guard-key": "header-key" },
      });
      const key = resolveRateLimitKey(options, req);

      expect(key).toBe("header-key");
    });

    test("should throw RateGuardError when no key can be resolved", () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        ip: undefined,
        headers: {},
        connection: { remoteAddress: undefined },
      });

      expect(() => resolveRateLimitKey(options, req)).toThrow(RateGuardError);
    });

    test("should throw RateGuardError with correct code", () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        ip: undefined,
        headers: {},
        connection: { remoteAddress: undefined },
      });

      try {
        resolveRateLimitKey(options, req);
        fail("Expected RateGuardError to be thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(RateGuardError);
        expect((err as RateGuardError).code).toBe("RGEC-0006");
      }
    });
  });
});
