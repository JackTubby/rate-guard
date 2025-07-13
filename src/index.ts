import express, { NextFunction, Request, Response } from "express"; // remove express once testing is setup
import { RateLimiterOptions } from "./types";
import RateLimiter from "./limiter";
import MemoryStore from "./store/memory";

export function createRateLimiter(options: RateLimiterOptions) {
  const store = options.store || new MemoryStore();
  const limiter = new RateLimiter(options, store);

  return async function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const ipAddress = req.ip || "";
    if (!ipAddress) {
      return next();
    }

    const canProceed = await limiter.checkLimit(ipAddress);

    if (canProceed) {
      next();
    } else {
      return res.status(429).json({ message: "Too many requests" });
    }
  };
}

const app = express();
app.use(createRateLimiter({}));
app.get("/", (req, res) => res.send("OK"));
app.listen(3000);
