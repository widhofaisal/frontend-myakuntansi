<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Edit User</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="fullName" class="form-label">Full Name</label>
            <input
              id="fullName"
              v-model="formData.fullname"
              type="text"
              class="form-input"
              :class="{ error: errors.fullname }"
              placeholder="Enter full name"
              required
            >
            <div v-if="errors.fullname" class="form-error">{{ errors.fullname }}</div>
          </div>

          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="form-input"
              :class="{ error: errors.username }"
              placeholder="Enter username"
              required
            >
            <div v-if="errors.username" class="form-error">{{ errors.username }}</div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password (leave blank to keep current)</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Enter new password"
            >
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label for="role" class="form-label">Role</label>
            <select
              id="role"
              v-model="formData.role"
              class="form-input"
              :class="{ error: errors.role }"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div v-if="errors.role" class="form-error">{{ errors.role }}</div>
          </div>

          <div v-if="errors.general" class="form-error">
            {{ errors.general }}
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button 
          @click="$emit('close')" 
          class="btn btn-secondary" 
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import api from '../../utils/axios'

export default {
  name: 'EditUserModal',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['saved', 'close'],
  setup(props, { emit }) {
    const formData = ref({
      fullname: props.user.fullname || '',
      username: props.user.username || '',
      password: '',
      role: props.user.role || 'user'
    })

    const errors = ref({})
    const isSubmitting = ref(false)

    const validateForm = () => {
      errors.value = {}
      let isValid = true

      if (!formData.value.fullname.trim()) {
        errors.value.fullname = 'Full name is required'
        isValid = false
      }

      if (!formData.value.username.trim()) {
        errors.value.username = 'Username is required'
        isValid = false
      }

      if (formData.value.password && formData.value.password.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
        isValid = false
      }

      return isValid
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      isSubmitting.value = true

      try {
        // Prepare the update data
        const updateData = {
          fullname: formData.value.fullname,
          username: formData.value.username,
          role: formData.value.role
        }

        // Only include password if it was changed
        if (formData.value.password) {
          updateData.password = formData.value.password
        }

        // Emit the saved event with the updated user data
        const response = await api.put(`/auth/users/${props.user.id}`, updateData)
        emit('saved', response.data.data)
        emit('close')
      } catch (error) {
        console.error('Update user error:', error)
        errors.value.general = 'Failed to update user. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    const handleOverlayClick = () => {
      if (!isSubmitting.value) {
        emit('close')
      }
    }

    return {
      formData,
      errors,
      isSubmitting,
      handleSubmit,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
/* Reuse the same styles as CreateFolderModal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--background-color);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
}

.form-input.error {
  border-color: var(--danger-color);
}

.form-error {
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: var(--background-color);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--background-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--surface-color);
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    margin: 0.5rem;
    max-width: none;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}
</style>
