<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <div class="brand-logo">
            <i class="fas fa-archive"></i>
            <h1>FileArchive</h1>
          </div>
          <p class="login-subtitle">Sign in to manage your files</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <div class="input-wrapper">
              <i class="fas fa-user input-icon"></i>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-input"
                :class="{ error: errors.username }"
                placeholder="Enter your username"
                required
              >
            </div>
            <div v-if="errors.username" class="form-error">{{ errors.username }}</div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.password }"
                placeholder="Enter your password"
                required
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="checkbox-input"
              >
              <span class="checkbox-custom"></span>
              Remember me
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg w-full"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading" class="spinner"></span>
            {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
          </button>

          <div v-if="errors.general" class="form-error text-center mt-4">
            {{ errors.general }}
          </div>
        </form>

        <!-- Demo Credentials -->
        <div class="demo-section">
          <div class="demo-divider">
            <span>Demo Credentials</span>
          </div>
          <div class="demo-credentials">
            <div class="demo-card">
              <h4>Admin Account</h4>
              <p><strong>Username:</strong> adamh</p>
              <p><strong>Password:</strong> qwerty123</p>
              <button @click="fillCredentials('admin')" class="btn btn-secondary btn-sm">
                Use Admin Credentials
              </button>
            </div>
            <div class="demo-card">
              <h4>Regular User</h4>
              <p><strong>Username:</strong> user</p>
              <p><strong>Password:</strong> password</p>
              <button @click="fillCredentials('user')" class="btn btn-secondary btn-sm">
                Use User Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const showPassword = ref(false)
    
    const form = reactive({
      username: '',
      password: '',
      rememberMe: false
    })
    
    const errors = reactive({
      username: '',
      password: '',
      general: ''
    })
    
    const validateForm = () => {
      // Reset errors
      Object.keys(errors).forEach(key => errors[key] = '')
      
      let isValid = true
      
      // Username validation
      if (!form.username) {
        errors.username = 'Username is required'
        isValid = false
      } 
      
      // Password validation
      if (!form.password) {
        errors.password = 'Password is required'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
        isValid = false
      }
      
      return isValid
    }
    
    const handleLogin = async () => {
      if (!validateForm()) return
      
      const result = await authStore.login({
        username: form.username,
        password: form.password,
        rememberMe: form.rememberMe
      })
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        errors.general = result.message || 'Login failed. Please try again.'
      }
    }
    
    const fillCredentials = (type) => {
      if (type === 'admin') {
        form.username = 'adamh'
        form.password = 'qwerty123'
      } else {
        form.username = 'user'
        form.password = 'password'
      }
    }
    
    return {
      authStore,
      form,
      errors,
      showPassword,
      handleLogin,
      fillCredentials
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 480px;
}

.login-card {
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 2.5rem 2rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.brand-logo i {
  font-size: 2.5rem;
  color: var(--primary-color);
}

.brand-logo h1 {
  color: var(--text-primary);
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.login-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1rem;
}

.login-form {
  padding: 2rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  z-index: 1;
}

.form-input {
  padding-left: 3rem;
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--border-radius-sm);
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-secondary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.demo-section {
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 2rem 2rem;
  background-color: #f8fafc;
}

.demo-divider {
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.demo-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border-color);
}

.demo-divider span {
  background-color: #f8fafc;
  padding: 0 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
}

.demo-credentials {
  display: grid;
  gap: 1rem;
}

.demo-card {
  background: white;
  padding: 1.25rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.demo-card h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.demo-card p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.demo-card strong {
  color: var(--text-primary);
}

.demo-card .btn {
  margin-top: 0.75rem;
  width: 100%;
}

/* Responsive Design */
@media (min-width: 768px) {
  .login-container {
    max-width: 520px;
  }
  
  .login-header {
    padding: 3rem 2.5rem 2rem;
  }
  
  .login-form {
    padding: 2.5rem;
  }
  
  .demo-section {
    padding: 2rem 2.5rem;
  }
  
  .demo-credentials {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }
  
  .login-header {
    padding: 2rem 1.5rem 1rem;
  }
  
  .login-form {
    padding: 1.5rem;
  }
  
  .demo-section {
    padding: 1.5rem;
  }
  
  .brand-logo h1 {
    font-size: 1.75rem;
  }
  
  .brand-logo i {
    font-size: 2rem;
  }
}
</style>
