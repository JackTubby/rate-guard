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


All stores will follow the same structre
- get - get the item from the store
- set - set the item in the store
- delete - delete the item in store
- getall - get all items in the store