import express, { NextFunction, Request, Response } from "express" // remove express once testing is setup
import { RateLimiterOptions } from "./types"
import RateLimiter from "./limiter"
import MemoryStore from "./store/memory"
import CleanUp from "./cleanup"

export function createRateLimiter(options: RateLimiterOptions) {
	const store = options.store || new MemoryStore()
	const limiter = new RateLimiter(options, store)
	if (options.enableCleanup !== false) {
		startPeriodicCleanup(store, options.cleanupInterval)
	}

	return async function rateLimiter(req: Request, res: Response, next: NextFunction) {
		const ipAddress = req.ip || ""
		if (!ipAddress) {
			return next()
		}
		console.log("incoming ip address: ", ipAddress)

		const canProceed = await limiter.checkLimit(ipAddress)

		if (canProceed.success) {
			console.log("Next...")
			next()
		} else {
			console.log("Too many requests")
			return res.status(429).json({ message: "Too many requests" })
		}
	}
}

async function startPeriodicCleanup(store: any, interval: number = 3600000) {
	const cleanup = new CleanUp(store, interval)
	cleanup.scheduleCleanup()
}

const app = express()
app.use(createRateLimiter({}))
app.get("/", (req, res) => res.send("OK"))
app.listen(3000)
