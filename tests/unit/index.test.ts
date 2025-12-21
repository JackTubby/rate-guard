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
  describe("keyGenerator", () => {
    test("should use keyGenerator when provided", async () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
        keyGenerator: () => "custom-key",
      } as const;

      const req = mockRequest();
      const key = await resolveRateLimitKey(options, req);

      expect(key).toBe("custom-key");
    });

    test("should pass request to keyGenerator", async () => {
      const keyGenerator = jest.fn(() => "generated-key");
      const options = {
        type: "tokenBucket",
        storeType: "memory",
        keyGenerator,
      } as const;

      const req = mockRequest({ ip: "192.168.1.1" });
      await resolveRateLimitKey(options, req);

      expect(keyGenerator).toHaveBeenCalledWith(req);
    });

    test("should support async keyGenerator", async () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
        keyGenerator: async () => "async-key",
      } as const;

      const req = mockRequest();
      const key = await resolveRateLimitKey(options, req);

      expect(key).toBe("async-key");
    });

    test("should allow keyGenerator to access request properties", async () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
        keyGenerator: (req: any) => `user:${req.headers["x-user-id"]}`,
      } as const;

      const req = mockRequest({
        headers: { "x-user-id": "12345" },
      });
      const key = await resolveRateLimitKey(options, req);

      expect(key).toBe("user:12345");
    });
  });

  describe("default key resolution", () => {
    test("should use req.ip when no keyGenerator provided", async () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({ ip: "192.168.1.1" });
      const key = await resolveRateLimitKey(options, req);

      expect(key).toBe("192.168.1.1");
    });

    test("should fall back to connection.remoteAddress when ip not available", async () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        ip: undefined,
        connection: { remoteAddress: "172.16.0.1" },
      });
      const key = await resolveRateLimitKey(options, req);

      expect(key).toBe("172.16.0.1");
    });

    test("should prefer req.ip over connection.remoteAddress", async () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        ip: "10.0.0.1",
        connection: { remoteAddress: "172.16.0.1" },
      });
      const key = await resolveRateLimitKey(options, req);

      expect(key).toBe("10.0.0.1");
    });
  });

  describe("error handling", () => {
    test("should throw RateGuardError when no key can be resolved", async () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        ip: undefined,
        headers: {},
        connection: { remoteAddress: undefined },
      });

      await expect(resolveRateLimitKey(options, req)).rejects.toThrow(
        RateGuardError
      );
    });

    test("should throw RateGuardError with code RGEC-0006", async () => {
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
        await resolveRateLimitKey(options, req);
        fail("Expected RateGuardError to be thrown");
      } catch (err) {
        expect(err).toBeInstanceOf(RateGuardError);
        expect((err as RateGuardError).code).toBe("RGEC-0006");
      }
    });

    test("should throw when connection object is missing", async () => {
      const options = {
        type: "tokenBucket",
        storeType: "memory",
      } as const;

      const req = mockRequest({
        ip: undefined,
        connection: undefined,
      });

      await expect(resolveRateLimitKey(options, req)).rejects.toThrow(
        RateGuardError
      );
    });
  });
});
