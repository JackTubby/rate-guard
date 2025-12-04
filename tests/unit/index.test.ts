import { RateGuardError } from "../../src/errors/errors";
import { createRateLimiter } from "../../src/index";
import RateLimiterFactory from "../../src/limiter";
import { Request, Response, NextFunction } from "express";

jest.mock("../../src/limiter", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

const mockRequest = (overrides = {}) =>
  ({
    headers: {},
    ip: "127.0.0.1",
    connection: { remoteAddress: "127.0.0.1" },
    ...overrides,
  }) as unknown as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe("createRateLimiter Initialise", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw an error for missing required options", () => {
    // @ts-expect-error
    expect(() => createRateLimiter()).toThrow(RateGuardError);

    // @ts-expect-error
    expect(() => createRateLimiter({ type: "tokenBucket" })).toThrow(
      RateGuardError
    );

    // @ts-expect-error
    expect(() => createRateLimiter({ storeType: "memory" })).toThrow(
      RateGuardError
    );
  });

  test("should call RateLimiterFactory.create() with correct arguments", () => {
    const options = {
      type: "tokenBucket",
      storeType: "memory",
    } as const;

    (RateLimiterFactory.create as jest.Mock).mockReturnValue({
      checkLimit: jest.fn().mockResolvedValue({ success: true }),
    });

    createRateLimiter(options);
    expect(RateLimiterFactory.create).toHaveBeenCalledWith(options);
  });
});

describe("createRateLimiter Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a function", () => {
    const options = {
      type: "tokenBucket",
      storeType: "memory",
    } as const;

    (RateLimiterFactory.create as jest.Mock).mockReturnValue({
      checkLimit: jest.fn().mockResolvedValue({ success: true }),
    });

    const middleware = createRateLimiter(options);
    expect(typeof middleware).toBe("function");
  });

  test("should call next() when rate limit check passes", async () => {
    const options = {
      type: "tokenBucket",
      storeType: "memory",
    } as const;

    (RateLimiterFactory.create as jest.Mock).mockReturnValue({
      checkLimit: jest.fn().mockResolvedValue({ success: true }),
    });

    const middleware = createRateLimiter(options);
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("should return 429 when rate limit exceeded", async () => {
    const options = {
      type: "tokenBucket",
      storeType: "memory",
    } as const;

    (RateLimiterFactory.create as jest.Mock).mockReturnValue({
      checkLimit: jest.fn().mockResolvedValue({ success: false }),
    });

    const middleware = createRateLimiter(options);
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: "Too many requests" });
  });

  test("should use custom message when rate limit exceeded", async () => {
    const options = {
      type: "tokenBucket",
      storeType: "memory",
      message: "Slow down!",
    } as const;

    (RateLimiterFactory.create as jest.Mock).mockReturnValue({
      checkLimit: jest.fn().mockResolvedValue({ success: false }),
    });

    const middleware = createRateLimiter(options);
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ message: "Slow down!" });
  });

  test("should return 500 when RateGuardError is thrown", async () => {
    const options = {
      type: "tokenBucket",
      storeType: "memory",
    } as const;

    (RateLimiterFactory.create as jest.Mock).mockReturnValue({
      checkLimit: jest
        .fn()
        .mockRejectedValue(new RateGuardError("RGEC-0006", "Test error")),
    });

    const middleware = createRateLimiter(options);
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      code: "RGEC-0006",
      name: "Missing key",
      message: "Missing required key: Test error",
    });
  });
});
