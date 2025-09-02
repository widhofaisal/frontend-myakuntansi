<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Upload Files</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Upload Area -->
        <div class="upload-area" :class="{ 'drag-over': isDragOver, 'has-files': selectedFiles.length > 0 }"
          @drop="handleDrop" @dragover.prevent @dragleave.prevent="handleDragLeave"
          @dragenter.prevent="handleDragEnter" @click="triggerFileInput">
          <input ref="fileInput" type="file" multiple @change="handleFileSelect" class="file-input">

          <div v-if="selectedFiles.length === 0" class="upload-prompt">
            <i class="fas fa-cloud-upload-alt"></i>
            <h4>Drop files here or click to browse</h4>
            <p>Select multiple files to upload to your archive</p>
          </div>

          <div v-else class="file-list">
            <h4>Selected Files ({{ selectedFiles.length }})</h4>
            <div class="file-items">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <div class="file-info">
                  <i :class="getFileIcon(file)"></i>
                  <div class="file-details">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>
                </div>
                <button @click="removeFile(index)" class="remove-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="upload-progress">
          <div class="progress-header">
            <span>Uploading files...</span>
            <span>{{ filesStore.uploadProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: filesStore.uploadProgress + '%' }"></div>
          </div>
        </div>

        <!-- Upload Options -->
        <div v-if="selectedFiles.length > 0 && !isUploading" class="upload-options">
          <div class="option-group">
            <label class="checkbox-label">
              <input v-model="uploadOptions.overwrite" type="checkbox" class="checkbox-input">
              <span class="checkbox-custom"></span>
              Overwrite existing files
            </label>
          </div>

          <div class="option-group">
            <label class="form-label">Upload to folder:</label>
            <div class="folder-path">
              <i class="fas fa-folder"></i>
              <span>{{ currentPath }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary" :disabled="isUploading">
          Cancel
        </button>
        <button @click="handleUpload" class="btn btn-primary" :disabled="selectedFiles.length === 0 || isUploading">
          <span v-if="isUploading" class="spinner"></span>
          {{ isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useFilesStore } from '../../stores/files'

export default {
  name: 'UploadModal',
  emits: ['close'],
  setup(props, { emit }) {
    const filesStore = useFilesStore()
    const fileInput = ref(null)
    const selectedFiles = ref([])
    const isDragOver = ref(false)
    const isUploading = ref(false)
    let dragCounter = 0

    const uploadOptions = ref({
      overwrite: false
    })

    const currentPath = computed(() => {
      return filesStore.currentPath || '/'
    })

    const triggerFileInput = () => {
      if (!isUploading.value) {
        fileInput.value?.click()
      }
    }

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      addFiles(files)
    }

    const handleDrop = (event) => {
      event.preventDefault()
      event.stopPropagation()
      isDragOver.value = false

      const files = Array.from(event.dataTransfer.files)
      if (files.length > 0) {
        addFiles(files)
      }
      dragCounter = 0
    }

    const addFiles = (files) => {
      // Filter out duplicates and add new files
      const newFiles = files.filter(file =>
        !selectedFiles.value.some(existing =>
          existing.name === file.name && existing.size === file.size
        )
      )
      selectedFiles.value.push(...newFiles)
    }

    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1)
    }

    const handleUpload = async () => {
      if (selectedFiles.value.length === 0) return

      isUploading.value = true

      try {
        const result = await filesStore.uploadFiles(selectedFiles.value)

        if (result.success) {
          emit('close')
        } else {
          alert(result.message || 'Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Upload failed. Please try again.')
      } finally {
        isUploading.value = false
      }
    }

    const handleOverlayClick = () => {
      if (!isUploading.value) {
        emit('close')
      }
    }

    const formatFileSize = (bytes) => {
      if (!bytes) return '0 B'
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getFileIcon = (file) => {
      const extension = file.name.split('.').pop()?.toUpperCase()

      const iconMap = {
        'PDF': 'fas fa-file-pdf text-red-500',
        'DOCX': 'fas fa-file-word text-blue-500',
        'DOC': 'fas fa-file-word text-blue-500',
        'XLSX': 'fas fa-file-excel text-green-500',
        'XLS': 'fas fa-file-excel text-green-500',
        'PPTX': 'fas fa-file-powerpoint text-orange-500',
        'PPT': 'fas fa-file-powerpoint text-orange-500',
        'JPG': 'fas fa-file-image text-purple-500',
        'JPEG': 'fas fa-file-image text-purple-500',
        'PNG': 'fas fa-file-image text-purple-500',
        'GIF': 'fas fa-file-image text-purple-500',
        'MP4': 'fas fa-file-video text-red-600',
        'AVI': 'fas fa-file-video text-red-600',
        'MOV': 'fas fa-file-video text-red-600',
        'MP3': 'fas fa-file-audio text-green-600',
        'WAV': 'fas fa-file-audio text-green-600',
        'ZIP': 'fas fa-file-archive text-yellow-600',
        'RAR': 'fas fa-file-archive text-yellow-600',
        'TXT': 'fas fa-file-alt text-gray-500'
      }

      return iconMap[extension] || 'fas fa-file text-gray-400'
    }

    const handleDragEnter = (event) => {
      event.preventDefault()
      event.stopPropagation()
      dragCounter++
      isDragOver.value = true
    }

    const handleDragLeave = (event) => {
      event.preventDefault()
      event.stopPropagation()
      dragCounter--
      if (dragCounter === 0) {
        isDragOver.value = false
      }
    }

    return {
      filesStore,
      fileInput,
      selectedFiles,
      isDragOver,
      isUploading,
      uploadOptions,
      currentPath,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      removeFile,
      handleUpload,
      handleOverlayClick,
      formatFileSize,
      getFileIcon,
      handleDragEnter,
      handleDragLeave
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

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--primary-color);
  background-color: rgba(59, 130, 246, 0.05);
}

.upload-area.has-files {
  cursor: default;
  text-align: left;
  align-items: flex-start;
  justify-content: flex-start;
}

.file-input {
  display: none;
}

.upload-prompt {
  color: var(--text-muted);
}

.upload-prompt i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.upload-prompt h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.upload-prompt p {
  margin: 0;
  font-size: 0.875rem;
}

.file-list {
  width: 100%;
}

.file-list h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.file-info i {
  font-size: 1.25rem;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.file-size {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: var(--error-color);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.upload-progress {
  margin: 1.5rem 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--background-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.upload-options {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.option-group {
  margin-bottom: 1rem;
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

.checkbox-input:checked+.checkbox-custom {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-input:checked+.checkbox-custom::after {
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

.folder-path {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
  color: var(--text-secondary);
  font-size: 0.875rem;
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

  .upload-area {
    padding: 1.5rem;
    min-height: 150px;
  }

  .upload-prompt i {
    font-size: 2rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>
