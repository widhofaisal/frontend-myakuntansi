/**
 * Session Management Utility
 * Provides secure session management with timeout handling and idle detection
 */

class SessionManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000 // 30 minutes default
    this.idleTimeout = 15 * 60 * 1000 // 15 minutes of inactivity
    this.warningTime = 5 * 60 * 1000 // Show warning 5 minutes before timeout

    this.lastActivity = Date.now()
    this.sessionTimer = null
    this.idleTimer = null
    this.warningTimer = null

    this.events = {
      sessionExpiring: 'session-expiring',
      sessionExpired: 'session-expired',
      idleWarning: 'idle-warning',
      activityDetected: 'activity-detected'
    }

    this.init()
  }

  // Initialize session management
  init() {
    this.setupActivityListeners()
    this.startSessionTimer()
    this.startIdleTimer()
  }

  // Set up activity listeners to detect user interaction
  setupActivityListeners() {
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll',
      'touchstart', 'click', 'keydown', 'keyup'
    ]

    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity()
      }, { passive: true })
    })
  }

  // Update last activity timestamp
  updateActivity() {
    this.lastActivity = Date.now()

    // Reset idle timer
    this.resetIdleTimer()

    // Emit activity detected event
    this.emit(this.events.activityDetected, { timestamp: this.lastActivity })
  }

  // Start session timeout timer
  startSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
    }

    this.sessionTimer = setTimeout(() => {
      this.handleSessionExpired()
    }, this.sessionTimeout)
  }

  // Start idle timeout timer
  startIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
    }

    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout()
    }, this.idleTimeout)
  }

  // Reset idle timer
  resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
    }
    this.startIdleTimer()
  }

  // Handle session expiration
  handleSessionExpired() {
    this.emit(this.events.sessionExpired, {
      reason: 'session_timeout',
      timestamp: Date.now()
    })

    // Automatically logout user
    this.logout()
  }

  // Handle idle timeout (show warning)
  handleIdleTimeout() {
    this.emit(this.events.idleWarning, {
      remainingTime: this.warningTime,
      timestamp: Date.now()
    })

    // Show warning to user
    this.showIdleWarning()
  }

  // Show idle warning dialog
  async showIdleWarning() {
    try {
      // Dynamic import to avoid circular dependencies
      const Swal = (await import('sweetalert2')).default

      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) return

      const result = await Swal.fire({
        title: 'Session Timeout Warning',
        text: `You will be automatically logged out in 5 minutes due to inactivity. Click "Stay Logged In" to continue your session.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Stay Logged In',
        cancelButtonText: 'Log Out Now',
        timer: this.warningTime,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          container: 'swal2-container',
          popup: 'swal2-popup',
          confirmButton: 'swal2-confirm',
          cancelButton: 'swal2-cancel'
        }
      })

      if (result.isConfirmed) {
        // User wants to stay logged in - extend session
        this.extendSession()
      } else {
        // User wants to logout or timer expired
        this.logout()
      }
    } catch (error) {
      console.error('Error showing idle warning:', error)
      this.logout()
    }
  }

  // Extend session (reset timers)
  extendSession() {
    this.updateActivity()
    this.startSessionTimer()

    // Clear warning timer if exists
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
    }
  }

  // Logout user
  async logout() {
    try {
      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()

      await authStore.logout()

      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Error during logout:', error)
      // Force redirect even if logout fails
      window.location.href = '/login'
    }
  }

  // Event emitter for session events
  emit(event, data) {
    const customEvent = new CustomEvent(event, { detail: data })
    document.dispatchEvent(customEvent)
  }

  // Add event listener for session events
  on(event, callback) {
    document.addEventListener(event, callback)
  }

  // Remove event listener
  off(event, callback) {
    document.removeEventListener(event, callback)
  }

  // Get time remaining until session expires
  getTimeRemaining() {
    const elapsed = Date.now() - this.lastActivity
    return Math.max(0, this.sessionTimeout - elapsed)
  }

  // Get idle time remaining
  getIdleTimeRemaining() {
    const elapsed = Date.now() - this.lastActivity
    return Math.max(0, this.idleTimeout - elapsed)
  }

  // Check if session is about to expire (within warning time)
  isSessionExpiringSoon() {
    return this.getTimeRemaining() <= this.warningTime
  }

  // Check if user is idle
  isUserIdle() {
    return this.getIdleTimeRemaining() <= 0
  }

  // Update session configuration
  updateConfig(config) {
    if (config.sessionTimeout) {
      this.sessionTimeout = config.sessionTimeout
    }

    if (config.idleTimeout) {
      this.idleTimeout = config.idleTimeout
    }

    if (config.warningTime) {
      this.warningTime = config.warningTime
    }

    // Restart timers with new configuration
    this.extendSession()
  }

  // Get session info for debugging
  getSessionInfo() {
    return {
      lastActivity: new Date(this.lastActivity).toISOString(),
      sessionTimeout: this.sessionTimeout,
      idleTimeout: this.idleTimeout,
      warningTime: this.warningTime,
      timeRemaining: this.getTimeRemaining(),
      idleTimeRemaining: this.getIdleTimeRemaining(),
      isExpiringSoon: this.isSessionExpiringSoon(),
      isIdle: this.isUserIdle()
    }
  }

  // Clean up timers and listeners
  destroy() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer)
    }

    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
    }

    // Remove activity listeners
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll',
      'touchstart', 'click', 'keydown', 'keyup'
    ]

    events.forEach(event => {
      document.removeEventListener(event, this.updateActivity)
    })
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()
export default sessionManager
