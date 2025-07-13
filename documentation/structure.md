# Strucutre

rate-limiter/
├── src/
│   ├── index.ts        # Entry point (exports middleware)
│   ├── store/
│   │   ├── memory.ts   # In-memory store for dev/demo
│   │   └── redis.ts    # Redis store for production
│   ├── limiter.ts      # Core logic (token bucket/sliding window)
│   └── types.ts        # Shared TypeScript types/interfaces
├── tests/
├── package.json
├── tsconfig.json
├── README.md
