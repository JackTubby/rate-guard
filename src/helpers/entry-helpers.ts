import { RateLimiterOptions } from "../../types/types";
import { RateGuardError } from "../errors/errors";
import { Request } from "express";

export function criticalOptions(options: RateLimiterOptions) {
  if (!options) return ["options missing"];
  const criticalOptions = ["type", "storeType"];
  const passedOptions = Object.keys(options);
  let missedOptions: string[] = [];
  criticalOptions.forEach((i) => {
    const b = passedOptions.includes(i);
    if (!b) {
      missedOptions.push(i);
    }
  });
  return missedOptions;
}

export function resolveRateLimitKey(
  options: RateLimiterOptions,
  req: Request
): string {
  if (options.type === "fixedWindow") {
    return "000";
  }

  const key =
    req.headers["x-rate-guard-key"] || req.ip || req.connection.remoteAddress;

  if (typeof key !== "string") {
    throw new RateGuardError(
      "RGEC-0006",
      "Could not resolve rate limit key: req.ip and req.connection.remoteAddress are both missing"
    );
  }

  return key;
}
