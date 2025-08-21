import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy load components for better performance
const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Explorer = () => import('../views/Explorer.vue')
const UserManagement = () => import('../views/UserManagement.vue')
const Profile = () => import('../views/Profile.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/explorer',
    name: 'Explorer',
    component: Explorer,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/logout',
    name: 'Logout',
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore()
      authStore.logout()
      next('/login')
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  // Check if route requires admin role
  if (to.meta.requiresAdmin && (!authStore.isAuthenticated || !authStore.isAdmin)) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router
