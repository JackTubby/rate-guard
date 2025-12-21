import { RateLimiterOptions } from "../../types/types";
import { RateGuardError } from "../errors/errors";
import { Request } from "express";

export function criticalOptions(options: RateLimiterOptions): string[] {
  if (!options) return ["options missing"];

  const required = ["type", "storeType"];
  return required.filter((opt) => !(opt in options));
}

export async function resolveRateLimitKey(
  options: RateLimiterOptions,
  req: Request
): Promise<string> {
  if (options.keyGenerator) {
    return options.keyGenerator(req);
  }

  const key = req.ip || req.connection?.remoteAddress;

  if (!key) {
    throw new RateGuardError(
      "RGEC-0006",
      "Could not resolve rate limit key: req.ip and req.connection.remoteAddress are both missing one must be valid"
    );
  }

  return key;
}
