# Rate Guard (BETA)

A TypeScript rate limiting middleware for Express.js. Supports memory and Redis storage, Token Bucket and Fixed Window algorithms.

**badges - build status - coverage to go here**

## Installation

```bash
npm install rate-guard
```

## Quick Start

```javascript
import express from "express";
import { createRateLimiter } from "rate-guard";

const app = express();

const limiter = createRateLimiter({
  storeType: "memory", // store type e.g memory or redis
  type: "tokenBucket", // choice of algo
  tokenLimit: 6, // 6 token limit within window
  timeFrame: 60000, // 1 minute
});

app.use(limiter);
app.get("/", (req, res) => res.send("Hello World!"));

app.listen(3000);
```

After exhausting your token limit, requests return `429 Too Many Requests`.

## Configuration

| Option       | Type                               | Required | Default               | Description                          |
| ------------ | ---------------------------------- | -------- | --------------------- | ------------------------------------ |
| `storeType`  | `'memory'` \| `'redis'`            | Yes      | -                     | Storage backend                      |
| `type`       | `'tokenBucket'` \| `'fixedWindow'` | Yes      | -                     | Rate limiting algorithm              |
| `store`      | `RedisClient`                      | If Redis | -                     | Redis client instance                |
| `tokenLimit` | `number`                           | No       | `50`                  | Requests allowed per window          |
| `timeFrame`  | `number`                           | No       | `900000`              | Window length in ms (default 15 min) |
| `ttl`        | `number`                           | No       | `86400000`            | Data expiry in ms (default 24 hours) |
| `message`    | `string`                           | No       | `'Too many requests'` | Response message when limited        |

## Usage

### Memory Store (Development)

```javascript
const limiter = createRateLimiter({
  storeType: "memory",
  type: "tokenBucket",
  tokenLimit: 100,
  timeFrame: 60000,
});
```

### Redis Store (Production)

```javascript
import { createClient } from "redis";

const redis = createClient({ url: "redis://localhost:6379" });
await redis.connect();

const limiter = createRateLimiter({
  storeType: "redis",
  store: redis,
  type: "tokenBucket",
  tokenLimit: 100,
  timeFrame: 60000,
});
```

### Per-Route Limiting

```javascript
const strictLimiter = createRateLimiter({
  storeType: "memory",
  type: "tokenBucket",
  tokenLimit: 10,
  timeFrame: 60000,
});

const relaxedLimiter = createRateLimiter({
  storeType: "memory",
  type: "tokenBucket",
  tokenLimit: 100,
  timeFrame: 60000,
});

app.post("/login", strictLimiter, loginHandler);
app.get("/api", relaxedLimiter, apiHandler);
```

### Per-Route Mix Limiting

```javascript
const perUserLimiter = createRateLimiter({
  storeType: "memory",
  type: "tokenBucket",
  tokenLimit: 100,
  timeFrame: 60000,
});

const globalLimiter = createRateLimiter({
  storeType: "memory",
  type: "fixedWindow",
  tokenLimit: 10000,
  timeFrame: 60000,
});

app.use(globalLimiter); // API-wide cap
app.get("/api", perUserLimiter, apiHandler); // Per-user limit
```

### Custom Error Message

```javascript
const limiter = createRateLimiter({
  storeType: "memory",
  type: "tokenBucket",
  tokenLimit: 100,
  timeFrame: 60000,
  message: "Slow down! Too many requests.",
});
```

## Algorithms

### Token Bucket

Per-user rate limiting with gradual token refill. Allows bursts while maintaining average rate.

- Tokens refill gradually over time
- Users can "save up" tokens for legitimate bursts
- Key: client IP address

```javascript
const limiter = createRateLimiter({
  storeType: "memory",
  type: "tokenBucket",
  tokenLimit: 60, // 60 tokens max
  timeFrame: 60000, // Refills completely in 60 seconds (1 token/sec)
});
```

### Fixed Window

Global rate limiting with full reset at window expiry. All users share the same token pool.

- Tokens reset completely when window expires
- Shared across all users (global limit)
- Key: `000` (single bucket)

```javascript
const limiter = createRateLimiter({
  storeType: "memory",
  type: "fixedWindow",
  tokenLimit: 1000, // 1000 requests per window
  timeFrame: 60000, // Window resets every 60 seconds
});
```

### Comparison

| Feature        | Token Bucket       | Fixed Window         |
| -------------- | ------------------ | -------------------- |
| Scope          | Per-user           | Global               |
| Refill         | Gradual            | Full reset           |
| Burst handling | Smooth             | Edge spikes possible |
| Use case       | User rate limiting | API-wide caps        |

## Storage Backends

### Memory

- Zero dependencies
- Fast (in-process)
- Single instance only
- Good for development and small deployments

### Redis

- Distributed rate limiting
- Works across multiple instances
- Production ready
- Requires Redis connection

## Concurrency Note

The default implementation uses non-atomic read-modify-write operations. For strict rate limiting under high concurrency with Redis, consider wrapping with your own atomic store implementation using Lua scripts.

## API

### `createRateLimiter(options)`

Returns an Express middleware function.

```typescript
type RateLimiterOptions =
  | {
      storeType: "memory";
      type: "tokenBucket" | "fixedWindow";
      tokenLimit?: number;
      timeFrame?: number;
      ttl?: number;
      message?: string;
    }
  | {
      storeType: "redis";
      store: RedisClient;
      type: "tokenBucket" | "fixedWindow";
      tokenLimit?: number;
      timeFrame?: number;
      ttl?: number;
      message?: string;
    };
```

### Response

When rate limited, returns:

```
HTTP 429 Too Many Requests
Content-Type: application/json

{ "message": "Too many requests" }
```

## Roadmap

- [ ] Sliding Window Log algorithm
- [ ] Sliding Window Counter algorithm
- [ ] Leaky Bucket algorithm
- [ ] Custom key resolver (`value` option)
- [ ] Rate limit headers (`X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- [ ] Automatic cleanup for memory store
- [ ] Custom response handlers
- [ ] Usage statistics / monitoring hooks (until implemented, manage Redis data directly)

## Author

**Jack Tubby** - [GitHub](https://github.com/jacktubby)

## Contributing

Contributions welcome. Please open an issue first to discuss proposed changes.

## License

[MIT License](./LICENSE)
