/**
 * Content Security Policy (CSP) Utility
 * Provides CSP header generation and management for security
 */

class CSPManager {
  constructor() {
    this.policies = this.getDefaultPolicies()
  }

  // Get default CSP policies for the application
  getDefaultPolicies() {
    return {
      // Restrict script sources to same-origin and trusted CDNs
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Vue.js development - remove in production
        "'unsafe-eval'", // Required for Vue.js development - remove in production
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://fonts.googleapis.com"
      ],

      // Restrict style sources
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for component styles - review in production
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com"
      ],

      // Restrict image sources
      'img-src': [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],

      // Restrict font sources
      'font-src': [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],

      // Restrict connection sources (AJAX, WebSockets, etc.)
      'connect-src': [
        "'self'",
        import.meta.env.VITE_API_BASE_URL || "https://api.example.com"
      ],

      // Restrict media sources
      'media-src': [
        "'self'",
        "blob:",
        "data:"
      ],

      // Restrict object/embed/applet sources
      'object-src': [
        "'none'"
      ],

      // Restrict frame sources
      'frame-src': [
        "'none'"
      ],

      // Restrict form actions
      'form-action': [
        "'self'"
      ],

      // Restrict base URI
      'base-uri': [
        "'self'"
      ],

      // Control referrer policy
      'referrer': [
        'strict-origin-when-cross-origin'
      ]
    }
  }

  // Generate CSP string from policies
  generateCSPString(policies = null) {
    const policiesToUse = policies || this.policies
    const cspParts = []

    Object.entries(policiesToUse).forEach(([directive, sources]) => {
      if (Array.isArray(sources) && sources.length > 0) {
        cspParts.push(`${directive} ${sources.join(' ')}`)
      }
    })

    return cspParts.join('; ')
  }

  // Get CSP meta tag for HTML
  getCSPMetaTag() {
    const cspString = this.generateCSPString()
    return `<meta http-equiv="Content-Security-Policy" content="${cspString}">`
  }

  // Get CSP as HTTP header
  getCSPHeader() {
    return {
      'Content-Security-Policy': this.generateCSPString()
    }
  }

  // Add nonce to policies for inline scripts/styles (for production)
  addNonce(nonce) {
    if (!nonce || typeof nonce !== 'string') {
      console.warn('Invalid nonce provided for CSP')
      return
    }

    // Add nonce to script-src and style-src
    if (this.policies['script-src']) {
      this.policies['script-src'].push(`'nonce-${nonce}'`)
    }

    if (this.policies['style-src']) {
      this.policies['style-src'].push(`'nonce-${nonce}'`)
    }
  }

  // Remove unsafe-inline and unsafe-eval for production
  secureForProduction() {
    // Remove unsafe-inline and unsafe-eval from script-src
    if (this.policies['script-src']) {
      this.policies['script-src'] = this.policies['script-src'].filter(src =>
        src !== "'unsafe-inline'" && src !== "'unsafe-eval'"
      )
    }

    // Remove unsafe-inline from style-src
    if (this.policies['style-src']) {
      this.policies['style-src'] = this.policies['style-src'].filter(src =>
        src !== "'unsafe-inline'"
      )
    }

    // Add strict-dynamic for modern browsers
    if (this.policies['script-src'] && !this.policies['script-src'].includes("'strict-dynamic'")) {
      this.policies['script-src'].push("'strict-dynamic'")
    }

    return this
  }

  // Update policies based on environment
  updateForEnvironment() {
    const isProduction = import.meta.env.PROD

    if (isProduction) {
      this.secureForProduction()
    }

    // Add development-specific policies
    if (import.meta.env.DEV) {
      // Allow webpack dev server
      if (this.policies['connect-src']) {
        this.policies['connect-src'].push('ws://localhost:*', 'wss://localhost:*')
      }

      // Allow Vite dev server
      if (this.policies['script-src']) {
        this.policies['script-src'].push('http://localhost:5173', 'http://localhost:8080')
      }
    }

    return this
  }

  // Get security headers bundle (CSP + other security headers)
  getSecurityHeaders() {
    this.updateForEnvironment()

    return {
      ...this.getCSPHeader(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': this.getPermissionsPolicy()
    }
  }

  // Get Permissions Policy (formerly Feature Policy)
  getPermissionsPolicy() {
    return [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()'
    ].join(', ')
  }

  // Initialize CSP manager
  initialize() {
    this.updateForEnvironment()

    // Set CSP meta tag if not already present
    if (typeof document !== 'undefined') {
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      if (!existingCSP) {
        const metaTag = document.createElement('meta')
        metaTag.httpEquiv = 'Content-Security-Policy'
        metaTag.content = this.generateCSPString()
        document.head.appendChild(metaTag)
      }
    }

    return this
  }
}

// Export singleton instance
export const cspManager = new CSPManager()
export default cspManager
