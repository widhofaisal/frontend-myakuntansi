/**
 * Secure Error Handling Utility
 * Provides secure error handling and sanitization to prevent information leakage
 */

class SecureErrorHandler {
  constructor() {
    this.sensitivePatterns = [
      // Database errors
      /SQLITE_.*:/i,
      /mysql.*:/i,
      /postgresql.*:/i,
      /mongodb.*:/i,

      // File system paths
      /\/home\/.*\//i,
      /\/var\/.*\//i,
      /\/usr\/.*\//i,
      /\/etc\/.*\//i,
      /C:\\.*\\/i,
      /D:\\.*\\/i,

      // Internal IP addresses
      /192\.168\.\d+\.\d+/,
      /10\.\d+\.\d+\.\d+/,
      /172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+/,
      /127\.\d+\.\d+\.\d+/,
      /localhost/,
      /0\.0\.0\.0/,

      // API keys and secrets
      /api[_-]?key/i,
      /secret/i,
      /token/i,
      /password/i,
      /credential/i,

      // Stack traces
      /at\s+\w+\.\w+\(/,
      /Error:\s+/,
      /stack.*trace/i,

      // Server information
      /nginx/i,
      /apache/i,
      /iis/i,
      /server.*error/i
    ]
  }

  // Sanitize error message for user display
  sanitizeErrorMessage(errorMessage) {
    if (typeof errorMessage !== 'string') {
      return 'An unexpected error occurred'
    }

    let sanitized = errorMessage

    // Remove sensitive patterns
    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]')
    })

    // Limit message length
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200) + '...'
    }

    // Ensure we have a fallback message
    return sanitized || 'An unexpected error occurred'
  }

  // Get user-friendly error message based on error type
  getUserFriendlyMessage(error) {
    if (!error) return 'An unexpected error occurred'

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection.'
    }

    // Timeout errors
    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      return 'The request timed out. Please try again.'
    }

    // Authentication errors
    if (error.response?.status === 401) {
      return 'Your session has expired. Please log in again.'
    }

    // Authorization errors
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.'
    }

    // Not found errors
    if (error.response?.status === 404) {
      return 'The requested resource was not found.'
    }

    // Rate limiting errors
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'] || error.retryAfter
      if (retryAfter) {
        return `Too many requests. Please try again in ${retryAfter} seconds.`
      }
      return 'Too many requests. Please try again later.'
    }

    // Server errors
    if (error.response?.status >= 500) {
      return 'A server error occurred. Please try again later.'
    }

    // Client errors (400-499)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return 'There was a problem with your request. Please check your input and try again.'
    }

    // Generic fallback
    return this.sanitizeErrorMessage(error.message || error.response?.data?.message || 'An unexpected error occurred')
  }

  // Log error securely (for debugging purposes)
  logError(error, context = '') {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR${context ? ` - ${context}` : ''}]:`, {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        timestamp: new Date().toISOString(),
        // Don't log sensitive data like headers or request body
        sanitizedMessage: this.sanitizeErrorMessage(error.message)
      })
    } else {
      // In production, you would send this to a logging service
      // Example: sendToLoggingService(error, context)
      console.error(`[PRODUCTION ERROR${context ? ` - ${context}` : ''}]:`, this.sanitizeErrorMessage(error.message))
    }
  }

  // Handle API errors consistently
  handleApiError(error, context = '') {
    // Log the error for debugging
    this.logError(error, context)

    // Return sanitized error for user display
    return {
      success: false,
      message: this.getUserFriendlyMessage(error),
      code: error.response?.status || error.status || 'UNKNOWN',
      timestamp: new Date().toISOString()
    }
  }

  // Wrap async functions with error handling
  async withErrorHandling(asyncFn, context = '') {
    try {
      return await asyncFn()
    } catch (error) {
      return this.handleApiError(error, context)
    }
  }

  // Create safe error boundary for Vue components
  createErrorBoundary(componentName = 'Component') {
    return {
      error: null,
      hasError: false,

      captureError(error) {
        this.error = error
        this.hasError = true

        // Log the error
        this.logError(error, `Component: ${componentName}`)

        return {
          success: false,
          message: 'An error occurred in this component. Please refresh the page.',
          component: componentName
        }
      },

      reset() {
        this.error = null
        this.hasError = false
      }
    }
  }

  // Validate and sanitize user input that might be displayed in errors
  sanitizeUserInput(input) {
    if (typeof input !== 'string') return ''

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .trim()
  }

  // Check if error should be reported (for error tracking services)
  shouldReportError(error) {
    // Don't report client-side validation errors or user-cancelled requests
    if (error.response?.status === 400 || error.code === 'CANCELLED') {
      return false
    }

    // Don't report authentication errors (normal user flow)
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false
    }

    // Report server errors and unexpected errors
    return error.response?.status >= 500 || !error.response
  }
}

// Export singleton instance
export const secureErrorHandler = new SecureErrorHandler()
export default secureErrorHandler
