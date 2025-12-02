# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- The changelog that you are reading :)
- Fixed Window algorithm implementation
- RedisClient interface for Redis store support
- Test workflow for PR merges

### Changed
- RateLimiterOptions now uses discriminated union types based on storeType
- Store interface updated to support multiple backends
- lastRefill updated to use better term of windowMs
- getAll method removed from memory store until cleanup functionality is complete

### Fixed
- (none)

## [0.1.0-beta.7] - 2025-11-XX
- Initial beta releases (prior to changelog)