<template>
  <div id="app">
    <!-- Navigation Header (only show when authenticated) -->
    <AppHeader v-if="authStore.isAuthenticated" />
    
    <!-- Main Content -->
    <main :class="{ 'with-header': authStore.isAuthenticated }">
      <router-view />
    </main>
    
    <!-- Global Loading Overlay -->
    <div v-if="isGlobalLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useFilesStore } from './stores/files'
import AppHeader from './components/layout/AppHeader.vue'

export default {
  name: 'App',
  components: {
    AppHeader
  },
  setup() {
    const authStore = useAuthStore()
    const filesStore = useFilesStore()
    
    const isGlobalLoading = computed(() => 
      authStore.isLoading || filesStore.isLoading
    )
    
    onMounted(() => {
      // Initialize authentication state from localStorage
      authStore.initializeAuth()
    })
    
    return {
      authStore,
      isGlobalLoading
    }
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  transition: all 0.3s ease;
}

main.with-header {
  padding-top: 70px; /* Account for fixed header */
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.loading-spinner .spinner {
  margin: 0 auto 1rem;
}

.loading-spinner p {
  margin: 0;
  color: var(--text-secondary);
}
</style>
