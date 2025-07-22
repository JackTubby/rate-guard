1. Token Bucket

Bucket holds tokens, refills at steady rate
Allows bursts up to bucket capacity
Used by: AWS, GitHub, Stripe

2. Leaky Bucket

Requests go into bucket, leak out at fixed rate
Smooths traffic, no bursts allowed
Used by: Network traffic shaping

3. Fixed Window

Count requests in fixed time windows (e.g., per minute)
Simple but has "thundering herd" at window boundaries
Used by: Basic APIs, simple implementations

4. Sliding Window Log

Store timestamp of every request
Perfect accuracy, no boundary issues
High memory usage for high-traffic APIs

5. Sliding Window Counter

Hybrid of fixed window + sliding log
Uses weighted average of current/previous windows
Used by: Cloudflare, Redis

Popularity Ranking

Token Bucket - Most popular (AWS, major APIs)
Sliding Window Counter - Production scale (Cloudflare)
Fixed Window - Simple implementations
Leaky Bucket - Network/infrastructure
Sliding Window Log - High-precision, low-traffic
