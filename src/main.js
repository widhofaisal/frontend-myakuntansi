import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import cspManager from './utils/csp'
import csrfProtection from './utils/csrf'
import sessionManager from './utils/sessionManager'

// Initialize security systems
cspManager.initialize()
csrfProtection.initialize()
sessionManager.init()

// Initialize auth store before mounting the app
async function initApp() {
  const app = createApp(App)

  // Use plugins
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  // Add toast notifications
  app.use(Toast, {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
  })

  // Initialize auth store
  const authStore = (await import('./stores/auth')).useAuthStore()
  authStore.initializeAuth()

  // Set up session management event listeners
  sessionManager.on('session-expired', () => {
    console.log('Session expired - logging out')
  })

  sessionManager.on('idle-warning', () => {
    console.log('User idle - showing warning')
  })

  // Mount the app
  app.mount('#app')

  return app
}

// Start the app
initApp().catch(error => {
  console.error('Failed to initialize app:', error)
})
