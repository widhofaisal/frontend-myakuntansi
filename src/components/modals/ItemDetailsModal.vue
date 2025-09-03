<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ item.type === 'folder' ? 'Folder' : 'File' }} Details</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Item Preview -->
        <div class="item-preview">
          <div class="preview-icon">
            <i :class="getItemIcon(item)"></i>
          </div>
          <div class="preview-info">
            <h4>{{ item.name }}</h4>
            <p class="item-type">{{ getItemTypeLabel(item) }}</p>
          </div>
        </div>
        <!-- Item Details -->
        <div class="details-section">
          <h5>General Information</h5>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{ item.name }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ getItemTypeLabel(item) }}</span>
            </div>

            <div v-if="item.type === 'file'" class="detail-item">
              <span class="detail-label">Format:</span>
              <span class="detail-value">{{ '.' + item.type }}</span>
            </div>
            
            <div v-if="!item.isFolder && !item.isLink" class="detail-item">
              <span class="detail-label">Size:</span>
              <span class="detail-value">{{ formatFileSize(item.size) }}</span>
            </div>
            
            <!-- <div v-if="item.isFolder" class="detail-item">
              <span class="detail-label">Contents:</span>
              <span class="detail-value">{{ getFolderContents(item) }}</span>
            </div> -->
            
            <div class="detail-item">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatDate(item.createdAt) }}</span>
            </div>
            
            <div v-if="item.isFolder" class="detail-item">
              <span class="detail-label">Modified:</span>
              <span class="detail-value">{{ formatDate(item.updatedAt) }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">Location:</span>
              <span class="detail-value">{{ filesStore.currentPath }}</span>
            </div>
            
            <div v-if="item.isLink" class="detail-item">
              <span class="detail-label">URL:</span>
              <span class="detail-value">
                <a :href="item.path" target="_blank" rel="noopener noreferrer" class="link-url">
                  {{ item.path }}
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </span>
            </div>
          </div>
        </div>

        <!-- File-specific details -->
        <div v-if="item.type === 'file' && !item.isLink" class="details-section">
          <h5>File Information</h5>
          <div class="details-grid">
            <div v-if="item.extension" class="detail-item">
              <span class="detail-label">Extension:</span>
              <span class="detail-value">.{{ item.extension }}</span>
            </div>
            
            <div v-if="item.mimeType" class="detail-item">
              <span class="detail-label">MIME Type:</span>
              <span class="detail-value">{{ item.mimeType }}</span>
            </div>
            
            <div v-if="isImageFile(item)" class="detail-item">
              <span class="detail-label">Dimensions:</span>
              <span class="detail-value">{{ getImageDimensions(item) }}</span>
            </div>
          </div>
        </div>

        <!-- Permissions section -->
        <!-- <div class="details-section">
          <h5>Permissions</h5>
          <div class="permissions-grid">
            <div class="permission-item">
              <i class="fas fa-eye"></i>
              <span>View</span>
              <span class="permission-status granted">✓</span>
            </div>
            <div class="permission-item">
              <i class="fas fa-download"></i>
              <span>Download</span>
              <span class="permission-status granted">✓</span>
            </div>
            <div class="permission-item">
              <i class="fas fa-edit"></i>
              <span>Edit</span>
              <span class="permission-status granted">✓</span>
            </div>
            <div class="permission-item">
              <i class="fas fa-trash"></i>
              <span>Delete</span>
              <span class="permission-status granted">✓</span>
            </div>
          </div>
        </div> -->

        <!-- Share information -->
        <div v-if="item.shared" class="details-section">
          <h5>Sharing</h5>
          <div class="share-info">
            <div class="share-status">
              <i class="fas fa-share-alt"></i>
              <span>This {{ item.type }} is shared</span>
            </div>
            <div class="share-details">
              <span class="detail-label">Shared with:</span>
              <span class="detail-value">{{ item.sharedWith || 'Team members' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Close
        </button>
        <div class="action-buttons">
          <button v-if="item.type === 'file'" @click="downloadItem" class="btn btn-outline">
            <i class="fas fa-download"></i>
            Download
          </button>
          <button v-if="item.isLink" @click="openLink" class="btn btn-outline">
            <i class="fas fa-external-link-alt"></i>
            Open Link
          </button>
          <button @click="editItem" class="btn btn-primary">
            <i class="fas fa-edit"></i>
            Rename
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useFilesStore } from '../../stores/files'

export default {
  name: 'ItemDetailsModal',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'edit', 'download'],
  setup(props, { emit }) {
    const filesStore = useFilesStore()
    const getItemIcon = (item) => {
      if (item.type === 'folder') {
        return 'fas fa-folder text-blue-500'
      }
      
      if (item.isLink) {
        const url = item.url?.toLowerCase() || ''
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          return 'fab fa-youtube text-red-600'
        } else if (url.includes('docs.google.com')) {
          return 'fab fa-google text-blue-500'
        } else if (url.includes('drive.google.com')) {
          return 'fab fa-google-drive text-green-500'
        } else {
          return 'fas fa-external-link-alt text-primary'
        }
      }
      
      const extension = item.extension?.toLowerCase()
      switch (extension) {
        case 'pdf':
          return 'fas fa-file-pdf text-red-500'
        case 'doc':
        case 'docx':
          return 'fas fa-file-word text-blue-600'
        case 'xls':
        case 'xlsx':
          return 'fas fa-file-excel text-green-600'
        case 'ppt':
        case 'pptx':
          return 'fas fa-file-powerpoint text-orange-500'
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'svg':
          return 'fas fa-file-image text-purple-500'
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
          return 'fas fa-file-video text-red-500'
        case 'mp3':
        case 'wav':
        case 'flac':
          return 'fas fa-file-audio text-green-500'
        case 'zip':
        case 'rar':
        case '7z':
          return 'fas fa-file-archive text-yellow-600'
        case 'txt':
          return 'fas fa-file-alt text-gray-600'
        case 'js':
        case 'html':
        case 'css':
        case 'php':
        case 'py':
          return 'fas fa-file-code text-blue-500'
        default:
          return 'fas fa-file text-gray-500'
      }
    }

    const getItemTypeLabel = (item) => {
      if (item.type === 'folder') {
        return 'Folder'
      }
      
      if (item.isLink) {
        return 'External Link'
      }
      
      if (item.extension) {
        return `${item.extension.toUpperCase()} File`
      }
      
      return 'File'
    }

    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown'
      
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getFolderContents = (folder) => {
      // This would typically come from the folder's metadata
      const fileCount = folder.fileCount || 0
      const folderCount = folder.folderCount || 0
      
      const parts = []
      if (folderCount > 0) {
        parts.push(`${folderCount} folder${folderCount !== 1 ? 's' : ''}`)
      }
      if (fileCount > 0) {
        parts.push(`${fileCount} file${fileCount !== 1 ? 's' : ''}`)
      }
      
      return parts.length > 0 ? parts.join(', ') : 'Empty folder'
    }

    const isImageFile = (item) => {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
      return imageExtensions.includes(item.extension?.toLowerCase())
    }

    const getImageDimensions = (item) => {
      // This would typically come from file metadata
      return item.dimensions || 'Unknown'
    }

    const downloadItem = () => {
      emit('download', props.item)
    }

    const openLink = () => {
      if (props.item.path) {
        window.open(props.item.path, '_blank', 'noopener,noreferrer')
      }
    }

    const editItem = () => {
      emit('edit', props.item)
    }

    const handleOverlayClick = () => {
      emit('close')
    }

    return {
      getItemIcon,
      getItemTypeLabel,
      formatFileSize,
      formatDate,
      getFolderContents,
      isImageFile,
      getImageDimensions,
      downloadItem,
      openLink,
      editItem,
      handleOverlayClick,
      filesStore
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
  max-width: 700px;
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

.item-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--background-color);
  border-radius: var(--border-radius-lg);
  margin-bottom: 2rem;
}

.preview-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.preview-icon i {
  font-size: 2rem;
}

.preview-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  word-break: break-word;
}

.item-type {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section h5 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.details-grid {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: start;
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.detail-value {
  color: var(--text-primary);
  font-size: 0.9rem;
  word-break: break-word;
}

.link-url {
  color: var(--primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.link-url:hover {
  text-decoration: underline;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.permission-item i {
  color: var(--text-muted);
  width: 16px;
}

.permission-status.granted {
  color: var(--success-color);
  font-weight: 600;
  margin-left: auto;
}

.share-info {
  padding: 1rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.share-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  font-weight: 500;
}

.share-details {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    margin: 0.5rem;
    max-width: none;
  }
  
  .item-preview {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .permissions-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .action-buttons .btn {
    flex: 1;
  }
}
</style>
