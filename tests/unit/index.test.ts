import { RateGuardError } from "../../src/errors/errors";
import { createRateLimiter } from "../../src/index";
import RateLimiterFactory from "../../src/limiter";

jest.mock("../../src/limiter", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

describe("createRateLimiter Initialise", () => {
  test("should throw an error for missing required options", () => {
    // @ts-expect-error
    expect(() => createRateLimiter()).toThrow(RateGuardError);

    // @ts-expect-error
    expect(() => createRateLimiter("tokenBucket")).toThrow(RateGuardError);

    // @ts-expect-error
    expect(() => createRateLimiter("memory")).toThrow(RateGuardError);
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
    expect(RateLimiterFactory.create).toHaveBeenCalledWith(
      options.type,
      options,
      options.storeType
    );
  });
});

describe("createRateLimiter Middleware", () => {
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
});
