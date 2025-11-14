import { defineStore } from 'pinia'
import api from '../utils/axios'
import secureStorage from '../utils/secureStorage'
import csrfProtection from '../utils/csrf'
import rateLimiter from '../utils/rateLimiter'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: secureStorage.getItem('secure_token') || null,
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user && !secureStorage.isExpired('secure_token'),
    isAdmin: (state) => state.user?.role === 'admin',
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        // Apply rate limiting to login attempts
        const throttledApiCall = rateLimiter.throttle('auth/login', async () => {
          return await api.post('/login', credentials)
        })

        const response = await throttledApiCall()

        this.token = response.data.data.token
        this.user = response.data.data.user

        // Store sensitive data securely with expiration (24 hours)
        secureStorage.setItem('secure_token', this.token, 24 * 60) // 24 hours
        secureStorage.setItem('secure_user', this.user, 24 * 60) // 24 hours
        if (this.user?.id) {
          secureStorage.setItem('secure_userId', this.user.id, 24 * 60)
        }

        return { success: true }
      } catch (error) {
        console.error('Login error:', error)

        // Handle rate limiting errors
        if (error.status === 429) {
          return {
            success: false,
            message: `Too many login attempts. Please try again in ${error.retryAfter} seconds.`,
            rateLimited: true,
            retryAfter: error.retryAfter
          }
        }

        return {
          success: false,
          message: error.response?.data?.message || 'Login failed'
        }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        // Call your logout API if needed
        // await api.post('/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear auth state
        this.token = null
        this.user = null

        // Remove all secure auth data
        secureStorage.removeItem('secure_token')
        secureStorage.removeItem('secure_user')
        secureStorage.removeItem('secure_userId')

        // Clear CSRF protection
        csrfProtection.cleanup()

        // Clear axios default headers
        delete api.defaults.headers.common['Authorization']
      }
    },

    initializeAuth() {
      try {
        const token = secureStorage.getItem('secure_token')
        const user = secureStorage.getItem('secure_user')
        const userId = secureStorage.getItem('secure_userId')

        if (token && !secureStorage.isExpired('secure_token')) {
          // Set the authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          // Only set user if valid data exists
          if (user && userId && typeof user === 'object') {
            this.user = user
            this.token = token
            return true
          } else {
            // Clean up invalid data
            this.logout()
          }
        }
        return false
      } catch (error) {
        console.error('Auth initialization error:', error)
        this.logout()
        return false
      }
    },

    async fetchUserData() {
      try {
        const response = await api.get('/auth/me')
        if (response.data && response.data.data) {
          this.user = response.data.data
          secureStorage.setItem('secure_user', this.user, 24 * 60) // Refresh expiration
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        this.logout()
      }
    },

    async updateProfile(profileData) {
      try {
        if (!this.user?.id) {
          // Try to initialize auth if user is not set
          this.initializeAuth()
          if (!this.user?.id) {
            throw new Error('User not authenticated')
          }
        }

        const response = await api.put(`/auth/users/${this.user.id}`, profileData)
        this.user = { ...this.user, ...response.data.data }
        secureStorage.setItem('secure_user', this.user, 24 * 60) // Refresh expiration
        return { success: true, message: 'Profile updated successfully' }
      } catch (error) {
        console.error('Update profile error:', error)
        return {
          success: false,
          message: error.response?.data?.message || error.message || 'Failed to update profile'
        }
      }
    },

    async changePassword(passwordData) {
      try {
        const response = await api.put(`/auth/users/${this.user.id}`, {
          password: passwordData.newPassword
        })
        return {
          success: true,
          message: 'Password changed successfully',
          data: response.data.data
        }
      } catch (error) {
        console.error('Change password error:', error)
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to change password',
          error: error
        }
      }
    }
  }
})
