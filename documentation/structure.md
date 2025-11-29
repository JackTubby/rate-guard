# Strucutre

rate-limiter/
├── src/
│   ├── index.ts        # Entry point (exports middleware)
│   ├── store/
│   │   ├── memory.ts   # In-memory store for dev/demo
│   │   └── redis.ts    # Redis store for production
|   ├── helpers/        # Application helper functions 
|   ├── limiters/
|   |   └── bucket.ts   # Token Bucket implementation
│   ├── errors/
│   |   └── errors.ts   # Custom error handling
│   └── limiter.ts      # Factory function to determine requests path
├── tests/
├── types/
|   └── types.ts        # Shared TypeScript types/interfaces
├── package.json
├── tsconfig.json
├── README.md


All stores will follow the same structre
- get - get the item from the store
- set - set the item in the store
- delete - delete the item in store
- getall - get all items in the store