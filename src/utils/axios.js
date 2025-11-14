import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'
import csrfProtection from './csrf'
import secureErrorHandler from './errorHandler'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 30000, // 30 seconds
})

// Request interceptor to add auth token and CSRF token to requests
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add CSRF token for state-changing requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      config.headers['X-CSRF-Token'] = csrfProtection.getToken()
    }

    return config
  },
  (error) => {
    // Handle request errors (network issues, etc.)
    const sanitizedError = secureErrorHandler.handleApiError(error, 'Request Setup')
    return Promise.reject(sanitizedError)
  }
)

// Response interceptor to handle token expiration and CSRF errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // Check if the error is due to an expired token and not a login attempt
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.endsWith('/login')) {
      originalRequest._retry = true

      // Ensure loading overlay is hidden before showing the dialog
      const loadingOverlay = document.querySelector('.loading-overlay')
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none'
      }

      try {
        // Show beautiful confirmation dialog with higher z-index
        const result = await Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Would you like to log in again?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, log me in',
          cancelButtonText: 'No, thanks',
          customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup',
            confirmButton: 'swal2-confirm',
            cancelButton: 'swal2-cancel'
          },
          buttonsStyling: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          focusConfirm: false,
          showClass: {
            popup: 'swal2-show',
            backdrop: 'swal2-backdrop-show',
            icon: 'swal2-icon-show'
          },
          hideClass: {
            popup: 'swal2-hide',
            backdrop: 'swal2-backdrop-hide',
            icon: 'swal2-icon-hide'
          }
        })

        if (result.isConfirmed) {
          // Clear auth state
          await authStore.logout()
          // Redirect to login page by forcing a full page reload
          window.location.href = '/login'
        } else {
          // If user clicks cancel, reload the page to reset the app state
          window.location.reload()
        }
      } catch (swalError) {
        console.error('Error showing session expired dialog:', swalError)
        // If there's an error showing the dialog, still log the user out
        await authStore.logout()
        window.location.href = '/login'
      }
    }

    // Handle CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.error?.includes('CSRF')) {
      // Refresh CSRF token and retry request
      csrfProtection.refreshToken()

      if (!originalRequest._csrfRetry) {
        originalRequest._csrfRetry = true
        originalRequest.headers['X-CSRF-Token'] = csrfProtection.getToken()
        return api(originalRequest)
      }
    }

    // Handle rate limiting errors
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after']
      if (retryAfter) {
        error.retryAfter = parseInt(retryAfter)
      }
    }

    // Sanitize and handle all errors consistently
    const sanitizedError = secureErrorHandler.handleApiError(error, 'API Response')

    return Promise.reject(sanitizedError)
  }
)

// Initialize CSRF protection
csrfProtection.initialize()

export default api
