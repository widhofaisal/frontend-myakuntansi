import { defineStore } from 'pinia'
import api from '../utils/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await api.post('/login', credentials)
        
        this.token = response.data.data.token
        this.user = response.data.data.user
        
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        console.log(this.user)
        localStorage.setItem('userId', this.user.id)
        
        return { success: true }
      } catch (error) {
        console.error('Login error:', error)
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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('userId')
        
        // Clear axios default headers
        delete api.defaults.headers.common['Authorization']
      }
    },

    initializeAuth() {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        const userId = localStorage.getItem('userId')
        
        if (token) {
          // Set the authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Only parse and set user if userStr exists and is valid JSON
          if (userStr && userId) {
            try {
              const user = JSON.parse(userStr)
              if (user && typeof user === 'object') {
                this.user = user
                this.token = token
                // Ensure userId is set in localStorage if it's missing
                if (!userId) {
                  localStorage.setItem('userId', user.id)
                }
                return true
              }
            } catch (e) {
              console.error('Failed to parse user data:', e)
              // Clean up invalid data
              localStorage.removeItem('user')
            }
          }
          
          // If we have a token but no valid user, try to fetch user data
          this.fetchUserData()
          return true
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
          localStorage.setItem('user', JSON.stringify(this.user))
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
        localStorage.setItem('user', JSON.stringify(this.user))
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
