import { defineStore } from 'pinia'
import axios from 'axios'

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
        // Replace with actual API endpoint
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, credentials)
        
        // Mock response for demo purposes
        // const response = {
        //   data: {
        //     token: 'mock-jwt-token-' + Date.now(),
        //     user: {
        //       id: 1,
        //       name: credentials.email === 'admin@example.com' ? 'Admin User' : 'Regular User',
        //       email: credentials.email,
        //       role: credentials.email === 'admin@example.com' ? 'admin' : 'user',
        //       avatar: 'https://via.placeholder.com/150',
        //       createdAt: new Date().toISOString()
        //     }
        //   }
        // }
        
        this.token = response.data.data.token
        this.user = response.data.data.user
        
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        
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
        // Call logout API if needed
        // await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`)
        
        this.user = null
        this.token = null
        
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        delete axios.defaults.headers.common['Authorization']
      } catch (error) {
        console.error('Logout error:', error)
      }
    },

    async initializeAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    },

    async updateProfile(profileData) {
      this.isLoading = true
      try {
        // Replace with actual API endpoint
        const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/user/profile`, profileData)
        
        // Mock response
        const updatedUser = { ...this.user, ...profileData }
        this.user = updatedUser
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        return { success: true }
      } catch (error) {
        console.error('Profile update error:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Profile update failed' 
        }
      } finally {
        this.isLoading = false
      }
    },

    async changePassword(passwordData) {
      this.isLoading = true
      try {
        // Replace with actual API endpoint
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/user/password`, passwordData)
        return { success: true }
      } catch (error) {
        console.error('Password change error:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Password change failed' 
        }
      } finally {
        this.isLoading = false
      }
    }
  }
})
