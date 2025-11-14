/**
 * Secure Storage Utility
 * Provides encrypted localStorage operations for sensitive data
 */

class SecureStorage {
  constructor() {
    this.secretKey = this.generateSecretKey()
  }

  // Generate a simple encryption key (in production, use a more robust method)
  generateSecretKey() {
    // In production, this should come from environment variables or be more secure
    const stored = localStorage.getItem('__secure_key__')
    if (stored) return stored

    const key = this.generateRandomString(32)
    localStorage.setItem('__secure_key__', key)
    return key
  }

  generateRandomString(length) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Simple XOR encryption (for demo purposes - use proper encryption in production)
  encrypt(text, key) {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return btoa(result) // Base64 encode
  }

  decrypt(encryptedText, key) {
    try {
      const text = atob(encryptedText) // Base64 decode
      let result = ''
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
      }
      return result
    } catch (error) {
      console.error('Decryption failed:', error)
      return null
    }
  }

  // Set item with expiration
  setItem(key, value, expirationMinutes = null) {
    const data = {
      value: this.encrypt(JSON.stringify(value), this.secretKey),
      timestamp: Date.now()
    }

    if (expirationMinutes) {
      data.expiration = Date.now() + (expirationMinutes * 60 * 1000)
    }

    localStorage.setItem(key, JSON.stringify(data))
  }

  // Get item with expiration check
  getItem(key) {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return null

      const data = JSON.parse(stored)

      // Check expiration
      if (data.expiration && Date.now() > data.expiration) {
        this.removeItem(key)
        return null
      }

      const decrypted = this.decrypt(data.value, this.secretKey)
      return decrypted ? JSON.parse(decrypted) : null
    } catch (error) {
      console.error('Failed to retrieve secure item:', error)
      this.removeItem(key)
      return null
    }
  }

  // Remove item
  removeItem(key) {
    localStorage.removeItem(key)
  }

  // Clear all secure items
  clear() {
    // Only clear items that start with our secure prefix
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key)
      }
    })
  }

  // Check if item is expired
  isExpired(key) {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return true

      const data = JSON.parse(stored)
      return data.expiration && Date.now() > data.expiration
    } catch (error) {
      return true
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage()
export default secureStorage
