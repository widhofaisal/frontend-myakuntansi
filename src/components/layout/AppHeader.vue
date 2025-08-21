<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <!-- Logo and Brand -->
        <div class="brand">
          <router-link to="/dashboard" class="brand-link">
            <i class="fas fa-archive"></i>
            <span class="brand-text">FileArchive</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <router-link to="/dashboard" class="nav-link" @click="handleNavigation('/dashboard', $event)">
            <i class="fas fa-chart-bar"></i>
            Dashboard
          </router-link>
          <router-link to="/explorer" class="nav-link" @click="handleNavigation('/explorer', $event)">
            <i class="fas fa-folder-open"></i>
            Explorer
          </router-link>
          <router-link v-if="authStore.isAdmin" to="/users" class="nav-link" @click="handleNavigation('/users', $event)">
            <i class="fas fa-users"></i>
            Users
          </router-link>
        </nav>

        <!-- User Menu -->
        <div class="user-menu">
          <div class="user-info" @click="toggleUserDropdown">
            <img :src="authStore.currentUser?.avatar || '/src/assets/img/profil-default.png'" :alt="authStore.currentUser?.name" class="user-avatar">
            <span class="user-name">{{ authStore.currentUser?.name }}</span>
            <i class="fas fa-chevron-down dropdown-icon" :class="{ 'rotated': showUserDropdown }"></i>
          </div>
          
          <!-- User Dropdown -->
          <div v-if="showUserDropdown" class="user-dropdown" @click.stop>
            <div class="dropdown-header">
              <div class="user-details">
                <strong>{{ authStore.currentUser?.name }}</strong>
                <small>{{ authStore.currentUser?.email }}</small>
                <span class="user-role" :class="authStore.currentUser?.role">
                  {{ authStore.currentUser?.role }}
                </span>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <router-link to="/profile" class="dropdown-item" @click="handleNavigation('/profile', $event)">
              <i class="fas fa-user"></i>
              Profile
            </router-link>
            <button @click="handleLogout" class="dropdown-item logout-btn">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div v-if="showMobileMenu" class="mobile-nav">
      <router-link to="/dashboard" class="mobile-nav-link" @click="handleNavigation('/dashboard', $event)">
        <i class="fas fa-chart-bar"></i>
        Dashboard
      </router-link>
      <router-link to="/explorer" class="mobile-nav-link" @click="handleNavigation('/explorer', $event)">
        <i class="fas fa-folder-open"></i>
        Explorer
      </router-link>
      <router-link v-if="authStore.isAdmin" to="/users" class="mobile-nav-link" @click="handleNavigation('/users', $event)">
        <i class="fas fa-users"></i>
        Users
      </router-link>
      <router-link to="/profile" class="mobile-nav-link" @click="handleNavigation('/profile', $event)">
        <i class="fas fa-user"></i>
        Profile
      </router-link>
      <button @click="handleLogout" class="mobile-nav-link logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>

    <!-- Overlay for mobile menu -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="showMobileMenu = false"></div>
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const showUserDropdown = ref(false)
    const showMobileMenu = ref(false)

    const toggleUserDropdown = () => {
      showUserDropdown.value = !showUserDropdown.value
      showMobileMenu.value = false
    }

    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
      showUserDropdown.value = false
    }

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
      showUserDropdown.value = false
      showMobileMenu.value = false
    }

    const debugNavigation = (page) => {
      console.log('Navigation clicked:', page)
      console.log('Auth state:', {
        isAuthenticated: authStore.isAuthenticated,
        user: authStore.currentUser,
        token: authStore.token
      })
    }

    const handleNavigation = (path, event) => {
      // Ensure navigation works by programmatically routing if needed
      console.log('Navigating to:', path)
      
      // Use nextTick to ensure any pending operations complete
      setTimeout(() => {
        if (router.currentRoute.value.path !== path) {
          router.push(path).catch(err => {
            console.warn('Navigation failed, retrying:', err)
            // Retry navigation after a short delay
            setTimeout(() => router.push(path), 50)
          })
        }
      }, 10)
    }

    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu')) {
        showUserDropdown.value = false
      }
      if (!event.target.closest('.mobile-nav') && !event.target.closest('.mobile-menu-toggle')) {
        showMobileMenu.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      authStore,
      showUserDropdown,
      showMobileMenu,
      toggleUserDropdown,
      toggleMobileMenu,
      handleLogout,
      debugNavigation,
      handleNavigation
    }
  }
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  z-index: 1000;
  height: 70px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1.25rem;
  gap: 0.5rem;
}

.brand-link:hover {
  color: var(--primary-dark);
}

.brand-text {
  display: none;
}

.desktop-nav {
  display: none;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-color);
  background-color: rgba(59, 130, 246, 0.1);
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
}

.user-info:hover {
  background-color: var(--background-color);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
  display: none;
}

.dropdown-icon {
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 1001;
  margin-top: 0.5rem;
}

.dropdown-header {
  padding: 1rem;
}

.user-details strong {
  display: block;
  color: var(--text-primary);
}

.user-details small {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.user-role {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.user-role.admin {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
}

.user-role.user {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--background-color);
  color: var(--text-primary);
}

.logout-btn {
  color: var(--error-color);
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.mobile-menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.mobile-menu-toggle:hover {
  background-color: var(--background-color);
  color: var(--text-primary);
}

.mobile-nav {
  position: fixed;
  top: 70px;
  right: 0;
  width: 280px;
  background: var(--surface-color);
  border-left: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  z-index: 1001;
  padding: 1rem 0;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: var(--text-secondary);
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background-color: var(--background-color);
  color: var(--primary-color);
}

.mobile-nav-link.logout-btn {
  color: var(--error-color);
}

.mobile-nav-link.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.mobile-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* Responsive Design */
@media (min-width: 768px) {
  .brand-text {
    display: block;
  }
  
  .user-name {
    display: block;
  }
  
  .desktop-nav {
    display: flex;
  }
  
  .mobile-menu-toggle {
    display: none;
  }
}

@media (min-width: 1024px) {
  .header-content {
    gap: 2rem;
  }
}
</style>
