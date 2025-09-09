<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Add Link</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="linkUrl" class="form-label">URL</label>
            <input
              id="linkUrl"
              ref="urlInput"
              v-model="linkData.url"
              type="url"
              class="form-input"
              :class="{ error: errors.url }"
              placeholder="https://example.com"
              required
            >
            <div v-if="errors.url" class="form-error">{{ errors.url }}</div>
            <p class="input-help">
              Add links to Google Docs, YouTube videos, or any other web resource
            </p>
          </div>

          <div class="form-group">
            <label for="linkName" class="form-label">Display Name</label>
            <input
              id="linkName"
              v-model="linkData.name"
              type="text"
              class="form-input"
              :class="{ error: errors.name }"
              placeholder="Enter a name for this link"
              maxlength="255"
              required
            >
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
            <p class="input-help">
              This name will be displayed in the file explorer
            </p>
          </div>

          <div class="form-group">
            <label for="linkDescription" class="form-label">Description (Optional)</label>
            <textarea
              id="linkDescription"
              v-model="linkData.description"
              class="form-input"
              rows="3"
              placeholder="Add a description for this link..."
              maxlength="500"
            ></textarea>
            <div class="char-count">
              {{ linkData.description.length }}/500 characters
            </div>
          </div>

          <!-- Link Preview -->
          <div v-if="linkPreview" class="link-preview">
            <h4>Link Preview</h4>
            <div class="preview-card">
              <div class="preview-icon">
                <i :class="getLinkIcon(linkData.url)"></i>
              </div>
              <div class="preview-info">
                <h5>{{ linkData.name || 'Untitled Link' }}</h5>
                <p class="preview-url">{{ linkData.url }}</p>
                <p v-if="linkData.description" class="preview-description">
                  {{ linkData.description }}
                </p>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Location</label>
            <div class="location-info">
              <i class="fas fa-folder"></i>
              <span>{{ currentPath }}</span>
            </div>
          </div>

          <div v-if="errors.general" class="form-error">
            {{ errors.general }}
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary" :disabled="isUploading">
          Cancel
        </button>
        <button
          @click="handleSubmit"
          class="btn btn-primary"
          :disabled="!isFormValid || isUploading"
        >
          <span v-if="isUploading" class="spinner"></span>
          {{ isUploading ? 'Adding...' : 'Add Link' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useFilesStore } from '../../stores/files'

export default {
  name: 'UploadLinkModal',
  emits: ['close'],
  setup(props, { emit }) {
    const filesStore = useFilesStore()
    const urlInput = ref(null)
    const isUploading = ref(false)
    const linkPreview = ref(false)
    
    const linkData = ref({
      url: '',
      name: '',
      description: ''
    })
    
    const errors = ref({
      url: '',
      name: '',
      general: ''
    })

    const currentPath = computed(() => {
      return filesStore.currentPath || '/'
    })

    const isFormValid = computed(() => {
      return linkData.value.url.trim() && 
             linkData.value.name.trim() && 
             !errors.value.url && 
             !errors.value.name
    })

    const validateUrl = () => {
      errors.value.url = ''
      
      const url = linkData.value.url.trim()
      if (!url) {
        errors.value.url = 'URL is required'
        return false
      }

      try {
        new URL(url)
      } catch {
        errors.value.url = 'Please enter a valid URL'
        return false
      }

      // Check for supported protocols
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        errors.value.url = 'URL must start with http:// or https://'
        return false
      }

      return true
    }

    const validateName = () => {
      errors.value.name = ''
      
      const name = linkData.value.name.trim()
      if (!name) {
        errors.value.name = 'Display name is required'
        return false
      }

      if (name.length > 255) {
        errors.value.name = 'Name is too long (max 255 characters)'
        return false
      }

      // Check if a file or folder with the same name already exists in the current directory
      const existingItem = [...filesStore.files, ...filesStore.folders].find(
        item => item.name.toLowerCase() === name.toLowerCase()
      )
      
      if (existingItem) {
        errors.value.name = `A ${existingItem.isFolder ? 'folder' : 'file'} with this name already exists`
        return false
      }

      return true
    }

    const getLinkIcon = (url) => {
      if (!url) return 'fas fa-link'
      
      const domain = url.toLowerCase()
      
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        return 'fab fa-youtube text-red-600'
      } else if (domain.includes('docs.google.com')) {
        return 'fab fa-google text-blue-500'
      } else if (domain.includes('drive.google.com')) {
        return 'fab fa-google-drive text-green-500'
      } else if (domain.includes('github.com')) {
        return 'fab fa-github text-gray-800'
      } else if (domain.includes('dropbox.com')) {
        return 'fab fa-dropbox text-blue-600'
      } else if (domain.includes('onedrive.live.com') || domain.includes('sharepoint.com')) {
        return 'fab fa-microsoft text-blue-500'
      } else if (domain.includes('vimeo.com')) {
        return 'fab fa-vimeo text-blue-400'
      } else if (domain.includes('figma.com')) {
        return 'fab fa-figma text-purple-500'
      } else {
        return 'fas fa-external-link-alt text-primary'
      }
    }

    const generateNameFromUrl = () => {
      if (!linkData.value.url || linkData.value.name) return
      
      try {
        const url = new URL(linkData.value.url)
        const domain = url.hostname.replace('www.', '')
        
        if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
          linkData.value.name = 'YouTube Video'
        } else if (domain.includes('docs.google.com')) {
          linkData.value.name = 'Google Document'
        } else if (domain.includes('drive.google.com')) {
          linkData.value.name = 'Google Drive File'
        } else if (domain.includes('github.com')) {
          linkData.value.name = 'GitHub Repository'
        } else {
          linkData.value.name = domain.charAt(0).toUpperCase() + domain.slice(1) + ' Link'
        }
      } catch {
        // Invalid URL, do nothing
      }
    }

    const handleSubmit = async () => {
      // Reset errors
      errors.value.general = ''
      
      // Validate form
      const isUrlValid = validateUrl()
      const isNameValid = validateName()
      
      if (!isUrlValid || !isNameValid) {
        return
      }
      
      isUploading.value = true
      
      try {
        const result = await filesStore.uploadLink(
          linkData.value.url.trim(),
          linkData.value.name.trim(),
          linkData.value.description?.trim()
        )
        
        if (result.success) {
          emit('close')
        } else {
          // If the error is about duplicate filename, show it in the name field
          if (result.error?.includes('already exists')) {
            errors.value.name = result.error
          } else {
            errors.value.general = result.error || 'Failed to add link. Please try again.'
          }
        }
      } catch (error) {
        console.error('Error uploading link:', error)
        const errorMessage = error.response?.data?.error || 'Failed to add link. Please try again.'
        
        if (errorMessage.includes('already exists')) {
          errors.value.name = errorMessage
        } else {
          errors.value.general = errorMessage
        }
      } finally {
        isUploading.value = false
      }
    }

    const handleOverlayClick = () => {
      if (!isUploading.value) {
        emit('close')
      }
    }

    // Watch for URL changes to generate name and show preview
    watch(() => linkData.value.url, (newUrl) => {
      if (newUrl && validateUrl()) {
        generateNameFromUrl()
        linkPreview.value = true
      } else {
        linkPreview.value = false
      }
    })

    onMounted(async () => {
      await nextTick()
      urlInput.value?.focus()
    })

    return {
      filesStore,
      urlInput,
      linkData,
      isUploading,
      linkPreview,
      errors,
      currentPath,
      isFormValid,
      getLinkIcon,
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
  max-width: 600px;
  max-height: 90vh;
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
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.input-help {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.link-preview {
  margin: 1.5rem 0;
  padding: 1.5rem 0;
  border-top: 1px solid var(--border-color);
}

.link-preview h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.preview-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.preview-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.preview-icon i {
  font-size: 1.5rem;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-info h5 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-url {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  word-break: break-all;
}

.preview-description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
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
  
  .preview-card {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}
</style>
