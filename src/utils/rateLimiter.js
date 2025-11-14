/**
 * Rate Limiting Utility
 * Provides client-side rate limiting and request throttling for security
 */

class RateLimiter {
  constructor() {
    this.requests = new Map()
    this.limits = {
      // Authentication endpoints
      'auth/login': { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
      'auth/register': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour

      // General API endpoints
      'api/default': { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute

      // File operations (more restrictive)
      'files/upload': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
      'files/download': { maxRequests: 50, windowMs: 60 * 1000 }, // 50 downloads per minute

      // Search operations
      'search': { maxRequests: 30, windowMs: 60 * 1000 } // 30 searches per minute
    }
  }

  // Get rate limit for endpoint
  getLimit(endpoint) {
    // Extract base endpoint pattern
    if (endpoint.includes('/login') || endpoint.includes('/auth/login')) {
      return this.limits['auth/login']
    }

    if (endpoint.includes('/register') || endpoint.includes('/auth/register')) {
      return this.limits['auth/register']
    }

    if (endpoint.includes('/upload') || endpoint.includes('/files/upload')) {
      return this.limits['files/upload']
    }

    if (endpoint.includes('/download') || endpoint.includes('/files/download')) {
      return this.limits['files/download']
    }

    if (endpoint.includes('/search')) {
      return this.limits['search']
    }

    return this.limits['api/default']
  }

  // Check if request should be allowed
  isAllowed(endpoint) {
    const limit = this.getLimit(endpoint)
    const now = Date.now()
    const windowStart = now - limit.windowMs

    // Clean old requests
    this.cleanup(windowStart)

    // Get requests for this endpoint pattern
    const endpointPattern = this.getEndpointPattern(endpoint)
    const endpointRequests = this.requests.get(endpointPattern) || []

    // Count requests within window
    const requestsInWindow = endpointRequests.filter(timestamp => timestamp > windowStart)

    if (requestsInWindow.length >= limit.maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((requestsInWindow[0] + limit.windowMs - now) / 1000)
      }
    }

    return { allowed: true }
  }

  // Record a request
  recordRequest(endpoint) {
    const endpointPattern = this.getEndpointPattern(endpoint)
    const now = Date.now()

    if (!this.requests.has(endpointPattern)) {
      this.requests.set(endpointPattern, [])
    }

    this.requests.get(endpointPattern).push(now)
  }

  // Get endpoint pattern for grouping similar requests
  getEndpointPattern(endpoint) {
    // Group similar endpoints together
    if (endpoint.includes('/login') || endpoint.includes('/auth/login')) {
      return 'auth/login'
    }

    if (endpoint.includes('/register') || endpoint.includes('/auth/register')) {
      return 'auth/register'
    }

    if (endpoint.includes('/files/upload') || endpoint.includes('/upload')) {
      return 'files/upload'
    }

    if (endpoint.includes('/files/download') || endpoint.includes('/download')) {
      return 'files/download'
    }

    if (endpoint.includes('/search')) {
      return 'search'
    }

    // Return the actual endpoint for specific tracking
    return endpoint
  }

  // Clean up old requests
  cleanup(beforeTimestamp) {
    for (const [endpoint, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter(timestamp => timestamp > beforeTimestamp)
      if (filtered.length === 0) {
        this.requests.delete(endpoint)
      } else {
        this.requests.set(endpoint, filtered)
      }
    }
  }

  // Get remaining requests for endpoint
  getRemainingRequests(endpoint) {
    const limit = this.getLimit(endpoint)
    const now = Date.now()
    const windowStart = now - limit.windowMs

    this.cleanup(windowStart)

    const endpointPattern = this.getEndpointPattern(endpoint)
    const endpointRequests = this.requests.get(endpointPattern) || []
    const requestsInWindow = endpointRequests.filter(timestamp => timestamp > windowStart)

    return Math.max(0, limit.maxRequests - requestsInWindow.length)
  }

  // Get reset time for endpoint
  getResetTime(endpoint) {
    const limit = this.getLimit(endpoint)
    const endpointPattern = this.getEndpointPattern(endpoint)
    const endpointRequests = this.requests.get(endpointPattern) || []

    if (endpointRequests.length === 0) {
      return Date.now()
    }

    // Find the oldest request in current window
    const now = Date.now()
    const windowStart = now - limit.windowMs
    const requestsInWindow = endpointRequests.filter(timestamp => timestamp > windowStart)

    if (requestsInWindow.length === 0) {
      return Date.now()
    }

    return requestsInWindow[0] + limit.windowMs
  }

  // Apply rate limiting to a function
  throttle(endpoint, fn) {
    return (...args) => {
      const check = this.isAllowed(endpoint)

      if (!check.allowed) {
        const error = new Error(`Rate limit exceeded. Try again in ${check.retryAfter} seconds.`)
        error.status = 429
        error.retryAfter = check.retryAfter
        throw error
      }

      this.recordRequest(endpoint)
      return fn(...args)
    }
  }

  // Get rate limit info for display
  getRateLimitInfo(endpoint) {
    const limit = this.getLimit(endpoint)
    const remaining = this.getRemainingRequests(endpoint)
    const resetTime = this.getResetTime(endpoint)
    const resetIn = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000))

    return {
      limit: limit.maxRequests,
      remaining,
      resetIn,
      windowMs: limit.windowMs
    }
  }

  // Reset all rate limiting data (useful for testing or logout)
  reset() {
    this.requests.clear()
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()
export default rateLimiter
