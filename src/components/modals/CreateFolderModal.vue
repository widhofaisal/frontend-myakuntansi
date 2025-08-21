<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Create New Folder</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="folderName" class="form-label">Folder Name</label>
            <input
              id="folderName"
              ref="nameInput"
              v-model="folderName"
              type="text"
              class="form-input"
              :class="{ error: errors.name }"
              placeholder="Enter folder name"
              maxlength="255"
              required
            >
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Location</label>
            <div class="location-info">
              <i class="fas fa-folder"></i>
              <span>{{ currentPath }}</span>
            </div>
            <p class="location-help">
              The folder will be created in the current directory
            </p>
          </div>

          <div v-if="errors.general" class="form-error">
            {{ errors.general }}
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary" :disabled="isCreating">
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="btn btn-primary"
          :disabled="!folderName.trim() || isCreating"
        >
          <span v-if="isCreating" class="spinner"></span>
          {{ isCreating ? 'Creating...' : 'Create Folder' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useFilesStore } from '../../stores/files'

export default {
  name: 'CreateFolderModal',
  emits: ['close'],
  setup(props, { emit }) {
    const filesStore = useFilesStore()
    const nameInput = ref(null)
    const folderName = ref('')
    const isCreating = ref(false)
    
    const errors = ref({
      name: '',
      general: ''
    })

    const currentPath = computed(() => {
      return filesStore.currentPath || '/'
    })

    const validateFolderName = () => {
      errors.value.name = ''
      errors.value.general = ''

      const name = folderName.value.trim()

      if (!name) {
        errors.value.name = 'Folder name is required'
        return false
      }

      if (name.length > 255) {
        errors.value.name = 'Folder name is too long (max 255 characters)'
        return false
      }

      // Check for invalid characters
      const invalidChars = /[<>:"/\\|?*]/
      if (invalidChars.test(name)) {
        errors.value.name = 'Folder name contains invalid characters'
        return false
      }

      // Check for reserved names (Windows)
      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
      if (reservedNames.includes(name.toUpperCase())) {
        errors.value.name = 'This folder name is reserved and cannot be used'
        return false
      }

      // Check if folder already exists
      const existingFolder = filesStore.folders.find(folder => 
        folder.name.toLowerCase() === name.toLowerCase()
      )
      if (existingFolder) {
        errors.value.name = 'A folder with this name already exists'
        return false
      }

      return true
    }

    const handleSubmit = async () => {
      if (!validateFolderName()) return

      isCreating.value = true

      try {
        const result = await filesStore.createFolder(folderName.value.trim())
        
        if (result.success) {
          emit('close')
        } else {
          errors.value.general = result.message || 'Failed to create folder'
        }
      } catch (error) {
        console.error('Create folder error:', error)
        errors.value.general = 'Failed to create folder. Please try again.'
      } finally {
        isCreating.value = false
      }
    }

    const handleOverlayClick = () => {
      if (!isCreating.value) {
        emit('close')
      }
    }

    onMounted(async () => {
      await nextTick()
      nameInput.value?.focus()
    })

    return {
      filesStore,
      nameInput,
      folderName,
      isCreating,
      errors,
      currentPath,
      handleSubmit,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
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
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-size: 0.875rem;
  border: 1px solid var(--border-color);
}

.location-info i {
  color: var(--primary-color);
}

.location-help {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
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
