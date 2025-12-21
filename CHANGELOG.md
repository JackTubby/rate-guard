# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0-beta.9] - 2025-12-21
- First version out of beta
- Update README.md file
- Update Fixed Window algo to be per user not global
- Namespace storage keys by algorithm type
- Add response headers X-RateLimit-Remaining, X-RateLimit-Limit, X-RateLimit-Reset
- Default ttl to timeframe if not set for redis storage
- Update checking key is set logic
- Test updates

## [0.1.0-beta.9] - 2025-12-04
### Added
- (none)

### Changed
- Update README.md file

### Fixed
- (none)

## [0.1.0-beta.8] - 2025-12-04
### Added
- The changelog that you are reading :)
- Fixed Window algorithm implementation
- RedisClient interface for Redis store support
- Test workflow for PR merges
- Full unit tests added

### Changed
- Refactor flow so algos just handle logic nothing else
- RateLimiterOptions now uses discriminated union types based on storeType
- Store interface updated to support multiple backends
- LastRefill updated to use better term of windowMs
- GetAll method removed from memory store until cleanup functionality is complete
- Handle defaults properly

### Fixed
- (none)

## [0.1.0-beta.7] - 2025-11-XX
- Initial beta releases (prior to changelog)