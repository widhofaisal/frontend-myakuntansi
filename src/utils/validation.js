/**
 * Input Validation and Sanitization Utility
 * Provides secure validation and sanitization functions for user inputs
 */

class ValidationUtil {
  // Sanitize string input - remove potentially dangerous characters
  sanitizeString(input) {
    if (typeof input !== 'string') return ''

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
  }

  // Sanitize HTML content (for rich text inputs)
  sanitizeHTML(input) {
    if (typeof input !== 'string') return ''

    // Basic HTML sanitization - in production, use a library like DOMPurify
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^>]*>/gi, '')
      .replace(/<object\b[^>]*>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .trim()
  }

  // Validate email format
  isValidEmail(email) {
    if (typeof email !== 'string') return false

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  // Validate password strength
  validatePassword(password) {
    if (typeof password !== 'string') return { valid: false, errors: ['Password must be a string'] }

    const errors = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long')
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)')
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty']
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Validate username
  validateUsername(username) {
    if (typeof username !== 'string') return { valid: false, errors: ['Username must be a string'] }

    const errors = []
    const sanitized = this.sanitizeString(username)

    if (sanitized.length < 3) {
      errors.push('Username must be at least 3 characters long')
    }

    if (sanitized.length > 30) {
      errors.push('Username must be less than 30 characters long')
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens')
    }

    if (/^[^a-zA-Z]/.test(sanitized)) {
      errors.push('Username must start with a letter')
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized
    }
  }

  // Validate phone number (basic international format)
  validatePhone(phone) {
    if (typeof phone !== 'string') return { valid: false, errors: ['Phone must be a string'] }

    const errors = []
    const sanitized = phone.replace(/\s+/g, '') // Remove spaces

    // Basic international phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(sanitized)) {
      errors.push('Please enter a valid phone number')
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized
    }
  }

  // Validate URL
  validateURL(url) {
    if (typeof url !== 'string') return { valid: false, errors: ['URL must be a string'] }

    const errors = []

    try {
      const urlObj = new URL(url)

      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol')
      }

      // Check for suspicious patterns
      if (urlObj.hostname.includes('localhost') && process.env.NODE_ENV === 'production') {
        errors.push('Localhost URLs are not allowed in production')
      }

    } catch (error) {
      errors.push('Please enter a valid URL')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Validate file upload
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [],
      maxFiles = 1
    } = options

    if (!file) return { valid: false, errors: ['No file provided'] }

    const errors = []

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
    }

    // Check file type if specified
    if (allowedTypes.length > 0) {
      const fileType = file.type.toLowerCase()
      const fileExtension = file.name.split('.').pop()?.toLowerCase()

      const isAllowed = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.slice(1)
        }
        return fileType.includes(type.toLowerCase())
      })

      if (!isAllowed) {
        errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Validate required fields
  validateRequired(value, fieldName = 'Field') {
    if (value === null || value === undefined || value === '') {
      return { valid: false, errors: [`${fieldName} is required`] }
    }

    return { valid: true, errors: [] }
  }

  // Validate number range
  validateNumber(value, options = {}) {
    const {
      min = -Infinity,
      max = Infinity,
      integer = false,
      fieldName = 'Number'
    } = options

    if (typeof value !== 'number' && isNaN(Number(value))) {
      return { valid: false, errors: [`${fieldName} must be a valid number`] }
    }

    const num = Number(value)
    const errors = []

    if (num < min) {
      errors.push(`${fieldName} must be at least ${min}`)
    }

    if (num > max) {
      errors.push(`${fieldName} must be at most ${max}`)
    }

    if (integer && !Number.isInteger(num)) {
      errors.push(`${fieldName} must be an integer`)
    }

    return {
      valid: errors.length === 0,
      errors,
      value: num
    }
  }

  // Comprehensive form validation
  validateForm(data, rules) {
    const errors = {}
    let isValid = true

    Object.keys(rules).forEach(field => {
      const value = data[field]
      const fieldRules = rules[field]

      if (fieldRules.required) {
        const requiredResult = this.validateRequired(value, fieldRules.label || field)
        if (!requiredResult.valid) {
          errors[field] = requiredResult.errors[0]
          isValid = false
        }
      }

      if (value && fieldRules.type) {
        let validationResult

        switch (fieldRules.type) {
          case 'email':
            if (!this.isValidEmail(value)) {
              errors[field] = fieldRules.message || `${fieldRules.label || field} must be a valid email`
              isValid = false
            }
            break

          case 'password':
            validationResult = this.validatePassword(value)
            if (!validationResult.valid) {
              errors[field] = validationResult.errors[0]
              isValid = false
            }
            break

          case 'username':
            validationResult = this.validateUsername(value)
            if (!validationResult.valid) {
              errors[field] = validationResult.errors[0]
              isValid = false
            }
            break

          case 'url':
            validationResult = this.validateURL(value)
            if (!validationResult.valid) {
              errors[field] = validationResult.errors[0]
              isValid = false
            }
            break

          case 'number':
            validationResult = this.validateNumber(value, fieldRules)
            if (!validationResult.valid) {
              errors[field] = validationResult.errors[0]
              isValid = false
            }
            break
        }

        // Custom validation function
        if (fieldRules.custom && typeof fieldRules.custom === 'function') {
          const customResult = fieldRules.custom(value)
          if (customResult !== true) {
            errors[field] = customResult || `${fieldRules.label || field} is invalid`
            isValid = false
          }
        }
      }
    })

    return { valid: isValid, errors }
  }

  // Escape HTML characters
  escapeHtml(text) {
    if (typeof text !== 'string') return ''

    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Decode HTML entities
  decodeHtml(text) {
    if (typeof text !== 'string') return ''

    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }
}

// Export singleton instance
export const validationUtil = new ValidationUtil()
export default validationUtil
