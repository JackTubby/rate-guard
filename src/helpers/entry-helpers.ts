import { RateLimiterOptions } from "../../types/types";

export function criticalOptions(options: RateLimiterOptions) {
  const criticalOptions = ["type", "storeType"]
  const passedOptions = Object.keys(options)
  let missedOptions: string[] = []
  criticalOptions.forEach(i => {
    const b = passedOptions.includes(i)
    if (!b) {
      missedOptions.push(i)
    }
  })
  return missedOptions;
}
