import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'

// Initialize auth store before mounting the app
async function initApp() {
  const app = createApp(App)
  
  // Use plugins
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  
  // Initialize auth store
  const authStore = (await import('./stores/auth')).useAuthStore()
  authStore.initializeAuth()
  
  // Mount the app
  app.mount('#app')
  
  return app
}

// Start the app
initApp().catch(error => {
  console.error('Failed to initialize app:', error)
})
