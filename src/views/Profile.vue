<template>
  <div class="profile">
    <div class="page-header">
      <h1>Profile Settings</h1>
      <p class="page-description">
        Manage your account information and security settings
      </p>
    </div>

    <div class="profile-container">
      <!-- Profile Information Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2>Profile Information</h2>
          <p>Update your personal information and preferences</p>
        </div>

        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input
                v-model="profileForm.name"
                type="text"
                class="form-input"
                :class="{ error: errors.name }"
                required
              >
              <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Username</label>
              <input
                v-model="profileForm.username"
                type="text"
                class="form-input"
                :class="{ error: errors.username }"
                required
              >
              <div v-if="errors.username" class="form-error">{{ errors.username }}</div>
            </div>
          </div>

          <!-- <div class="form-group">
            <label class="form-label">Bio (Optional)</label>
            <textarea
              v-model="profileForm.bio"
              class="form-input"
              rows="3"
              placeholder="Tell us about yourself..."
              maxlength="500"
            ></textarea>
            <div class="char-count">{{ profileForm.bio.length }}/500 characters</div>
          </div> -->

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isUpdatingProfile"
            >
              <span v-if="isUpdatingProfile" class="spinner"></span>
              {{ isUpdatingProfile ? 'Updating...' : 'Update Profile' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Password Change Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2>Change Password</h2>
          <p>Update your password to keep your account secure</p>
        </div>

        <form @submit.prevent="changePassword" class="password-form">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <div class="password-input-wrapper">
              <input
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.currentPassword }"
                required
              >
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="password-toggle"
              >
                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="errors.currentPassword" class="form-error">{{ errors.currentPassword }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">New Password</label>
            <div class="password-input-wrapper">
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.newPassword }"
                required
              >
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="password-toggle"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="errors.newPassword" class="form-error">{{ errors.newPassword }}</div>
            <div class="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li :class="{ valid: passwordValidation.length }">At least 8 characters</li>
                <li :class="{ valid: passwordValidation.uppercase }">One uppercase letter</li>
                <li :class="{ valid: passwordValidation.lowercase }">One lowercase letter</li>
                <li :class="{ valid: passwordValidation.number }">One number</li>
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <div class="password-input-wrapper">
              <input
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.confirmPassword }"
                required
              >
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="password-toggle"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isPasswordValid || isChangingPassword"
            >
              <span v-if="isChangingPassword" class="spinner"></span>
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Account Information Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2>Account Information</h2>
          <p>View your account details and statistics</p>
        </div>

        <div class="account-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Account Type:</span>
              <span class="info-value">
                <span :class="['role-badge', authStore.user.role]">
                  <i :class="authStore.user.role === 'admin' ? 'fas fa-crown' : 'fas fa-user'"></i>
                  {{ authStore.user.role === 'admin' ? 'Administrator' : 'Regular User' }}
                </span>
              </span>
            </div>

            <div class="info-item">
              <span class="info-label">Member Since:</span>
              <span class="info-value">{{ formatDate(authStore.user.createdAt) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Last Login:</span>
              <span class="info-value">{{ formatDate(authStore.user.lastLoginAt) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Storage Used:</span>
              <span class="info-value">2.3 GB of 10 GB</span>
            </div>

            <div class="info-item">
              <span class="info-label">Files Uploaded:</span>
              <span class="info-value">147 files</span>
            </div>

            <div class="info-item">
              <span class="info-label">Folders Created:</span>
              <span class="info-value">23 folders</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="alert alert-success">
      <i class="fas fa-check-circle"></i>
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="alert alert-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    
    const isUpdatingProfile = ref(false)
    const isChangingPassword = ref(false)
    const showCurrentPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')
    
    const profileForm = ref({
      name: '',
      username: '',
      // bio: ''
    })
    
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const errors = ref({
      name: '',
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const passwordValidation = computed(() => {
      const password = passwordForm.value.newPassword
      return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password)
      }
    })

    const isPasswordValid = computed(() => {
      return Object.values(passwordValidation.value).every(valid => valid) &&
             passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
             passwordForm.value.currentPassword
    })

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const clearMessages = () => {
      successMessage.value = ''
      errorMessage.value = ''
    }

    const validateProfileForm = () => {
      errors.value = {
        name: '',
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }

      if (!profileForm.value.name.trim()) {
        errors.value.name = 'Name is required'
        return false
      }

      if (!profileForm.value.username.trim()) {
        errors.value.username = 'Username is required'
        return false
      }

      return true
    }

    const validatePasswordForm = () => {
      if (!passwordForm.value.currentPassword) {
        errors.value.currentPassword = 'Current password is required'
        return false
      }

      if (!passwordForm.value.newPassword) {
        errors.value.newPassword = 'New password is required'
        return false
      }

      if (!Object.values(passwordValidation.value).every(valid => valid)) {
        errors.value.newPassword = 'Password does not meet requirements'
        return false
      }

      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        errors.value.confirmPassword = 'Passwords do not match'
        return false
      }

      return true
    }

    const updateProfile = async () => {
      clearMessages()
      
      if (!validateProfileForm()) return

      isUpdatingProfile.value = true

      try {
        const result = await authStore.updateProfile(profileForm.value)
        
        if (result.success) {
          successMessage.value = 'Profile updated successfully!'
          setTimeout(() => {
            successMessage.value = ''
          }, 3000)
        } else {
          errorMessage.value = result.message || 'Failed to update profile'
        }
      } catch (error) {
        console.error('Update profile error:', error)
        errorMessage.value = 'Failed to update profile. Please try again.'
      } finally {
        isUpdatingProfile.value = false
      }
    }

    const changePassword = async () => {
      clearMessages()
      
      if (!validatePasswordForm()) return

      isChangingPassword.value = true

      try {
        const result = await authStore.changePassword(
          passwordForm.value.currentPassword,
          passwordForm.value.newPassword
        )
        
        if (result.success) {
          successMessage.value = 'Password changed successfully!'
          passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
          setTimeout(() => {
            successMessage.value = ''
          }, 3000)
        } else {
          errorMessage.value = result.message || 'Failed to change password'
        }
      } catch (error) {
        console.error('Change password error:', error)
        errorMessage.value = 'Failed to change password. Please try again.'
      } finally {
        isChangingPassword.value = false
      }
    }

    // Watch for password confirmation
    watch(() => passwordForm.value.confirmPassword, () => {
      if (passwordForm.value.confirmPassword && 
          passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        errors.value.confirmPassword = 'Passwords do not match'
      } else {
        errors.value.confirmPassword = ''
      }
    })

    onMounted(() => {
      // Initialize form with current user data
      if (authStore.user) {
        profileForm.value = {
          name: authStore.user.name || '',
          username: authStore.user.username || '',
          // bio: authStore.user.bio || ''
        }
      }
    })

    return {
      authStore,
      profileForm,
      passwordForm,
      errors,
      isUpdatingProfile,
      isChangingPassword,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      successMessage,
      errorMessage,
      passwordValidation,
      isPasswordValid,
      formatDate,
      updateProfile,
      changePassword
    }
  }
}
</script>

<style scoped>
.profile {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.page-description {
  margin: 0;
  color: var(--text-muted);
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.section-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.password-requirements {
  margin-top: 0.5rem;
  padding: 1rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.password-requirements p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.password-requirements ul {
  margin: 0;
  padding-left: 1.5rem;
  list-style: none;
}

.password-requirements li {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
  position: relative;
}

.password-requirements li::before {
  content: '✗';
  position: absolute;
  left: -1.25rem;
  color: var(--danger-color);
}

.password-requirements li.valid {
  color: var(--success-color);
}

.password-requirements li.valid::before {
  content: '✓';
  color: var(--success-color);
}

.form-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.account-info {
  margin-top: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.info-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.role-badge.admin {
  background: var(--warning-color);
  color: white;
}

.role-badge.user {
  background: var(--background-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.alert {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
}

.alert-success {
  background: var(--success-color);
  color: white;
}

.alert-error {
  background: var(--danger-color);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .alert {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>
