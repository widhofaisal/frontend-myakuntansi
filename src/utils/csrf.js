/**
 * CSRF Protection Utility
 * Provides CSRF token generation, validation, and management
 */

class CSRFProtection {
  constructor() {
    this.tokenKey = 'csrf_token'
    this.token = this.getStoredToken() || this.generateToken()
  }

  // Generate a cryptographically secure CSRF token
  generateToken() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')

    // Store in sessionStorage for persistence across page reloads
    sessionStorage.setItem(this.tokenKey, token)
    return token
  }

  // Get stored token or generate new one
  getStoredToken() {
    return sessionStorage.getItem(this.tokenKey)
  }

  // Get current CSRF token
  getToken() {
    if (!this.token || !this.getStoredToken()) {
      this.token = this.generateToken()
    }
    return this.token
  }

  // Validate CSRF token (simple comparison for demo - use proper validation in production)
  validateToken(token) {
    return this.getToken() === token
  }

  // Get CSRF token for forms (meta tag approach)
  getTokenForMeta() {
    return this.getToken()
  }

  // Refresh token (call this after successful authentication or periodically)
  refreshToken() {
    this.token = this.generateToken()
    return this.token
  }

  // Add CSRF token to request headers
  addTokenToHeaders(headers = {}) {
    headers['X-CSRF-Token'] = this.getToken()
    return headers
  }

  // Add CSRF token to form data
  addTokenToFormData(formData) {
    if (formData instanceof FormData) {
      formData.append('csrf_token', this.getToken())
    } else if (typeof formData === 'object') {
      formData.csrf_token = this.getToken()
    }
    return formData
  }

  // Validate request has correct CSRF token
  validateRequest(requestData) {
    const token = requestData.csrf_token || requestData.headers?.['X-CSRF-Token']
    return this.validateToken(token)
  }

  // Get CSRF token for Axios requests
  getAxiosConfig(method = 'GET') {
    const config = {}

    // Only add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
      config.headers = this.addTokenToHeaders(config.headers)
    }

    return config
  }

  // Initialize CSRF protection (call this early in app lifecycle)
  initialize() {
    // Set up periodic token refresh (every 30 minutes)
    setInterval(() => {
      this.refreshToken()
    }, 30 * 60 * 1000)

    // Refresh token on page focus (when user returns to tab)
    window.addEventListener('focus', () => {
      const storedToken = this.getStoredToken()
      if (!storedToken) {
        this.refreshToken()
      }
    })

    return this.getToken()
  }

  // Clean up CSRF data (call on logout)
  cleanup() {
    sessionStorage.removeItem(this.tokenKey)
    this.token = null
  }
}

// Export singleton instance
export const csrfProtection = new CSRFProtection()
export default csrfProtection
