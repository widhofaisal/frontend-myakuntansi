<template>
  <div class="explorer">
    <div class="container">
      <!-- Toolbar -->
      <div class="explorer-toolbar">
        <!-- Breadcrumbs -->
        <div class="breadcrumbs">
          <!-- Debug: Show breadcrumbs data -->
          <div v-if="false" style="display: none;">
            {{ filesStore.breadcrumbs }}
            {{ filesStore.breadcrumbItems }}
          </div>
          <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id ?? index">
            <button class="breadcrumb-item" :class="{ active: index === breadcrumbs.length - 1 }"
              :disabled="index === breadcrumbs.length - 1"
              @click="index === breadcrumbs.length - 1 ? null : navigateToPath(crumb.id)">
              <i v-if="index === 0" class="fas fa-home"></i>
              <span v-else>{{ crumb.name }}</span>
            </button>
            <i v-if="index < breadcrumbs.length - 1" class="fas fa-chevron-right separator"></i>
          </template>
        </div>

        <!-- Actions -->
        <div class="toolbar-actions">
          <button @click="showUploadModal = true" class="btn btn-primary">
            <i class="fas fa-upload"></i>
            Upload
          </button>
          <button @click="showCreateFolderModal = true" class="btn btn-secondary">
            <i class="fas fa-folder-plus"></i>
            New Folder
          </button>
          <button @click="showUploadLinkModal = true" class="btn btn-secondary">
            <i class="fas fa-link"></i>
            Add Link
          </button>
        </div>
      </div>

      <!-- Search and View Controls -->
      <div class="controls-bar">
        <div class="search-section">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input v-model="filesStore.searchQuery" type="text" placeholder="Search files and folders..."
              class="search-input">
            <button v-if="filesStore.searchQuery" @click="filesStore.setSearchQuery('')" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="view-controls">
          <!-- Sort Options -->
          <div class="sort-dropdown">
            <select :value="filesStore.sortBy" @change="handleSortChange" class="sort-select">
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="type">Sort by Type</option>
              <option value="size">Sort by Size</option>
            </select>
            <button @click="toggleSortOrder" class="sort-order-btn"
              :title="filesStore.sortOrder === 'asc' ? 'Ascending' : 'Descending'">
              <i :class="filesStore.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
            </button>
          </div>

          <!-- View Mode Toggle -->
          <div class="view-toggle">
            <button @click="filesStore.setViewMode('grid')" class="view-btn"
              :class="{ active: filesStore.viewMode === 'grid' }" title="Grid View">
              <i class="fas fa-th"></i>
            </button>
            <button @click="filesStore.setViewMode('list')" class="view-btn"
              :class="{ active: filesStore.viewMode === 'list' }" title="List View">
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- File Grid/List -->
      <div class="file-area" :class="{ 'drag-over': isDragOver }" @drop="handleDrop"
        @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false" @dragenter.prevent>
        <!-- Empty State -->
        <div v-if="filesStore.filteredItems.length === 0 && !filesStore.isLoading" class="empty-state">
          <i class="fas fa-folder-open"></i>
          <h3>This folder is empty</h3>
          <p>Upload files or create folders to get started</p>
          <button @click="showUploadModal = true" class="btn btn-primary">
            <i class="fas fa-upload"></i>
            Upload Files
          </button>
        </div>

        <!-- Grid View -->
        <div v-else-if="filesStore.viewMode === 'grid'" class="file-grid">
          <div v-for="item in filesStore.filteredItems" :key="item.id" class="file-item"
            @dblclick="openItem(item, $event)">
            <div class="file-icon">
              <i :class="getFileIcon(item)"></i>
              <div v-if="item.isLink" class="link-indicator">
                <i class="fas fa-link"></i>
              </div>
            </div>
            <div class="file-info">
              <h4 class="file-name" :title="item.name">{{ item.name }}</h4>
              <p class="file-meta">
                <span v-if="!item.isFolder && item.size">{{ formatFileSize(item.size) }}</span>
                <span>{{ formatDate(item.modifiedAt || item.createdAt) }}</span>
              </p>
            </div>
            <div class="file-actions">
              <button @click.stop="showItemDetails(item)" class="action-btn" title="Details">
                <i class="fas fa-info-circle"></i>
              </button>
              <button v-if="!item.isFolder && !item.isLink" @click.stop="downloadItem(item)" class="action-btn"
                title="Download">
                <i class="fas fa-download"></i>
              </button>
              <button @click.stop="deleteItem(item)" class="action-btn text-danger" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="file-list">
          <div class="list-header">
            <div class="col-name">Name</div>
            <div class="col-size">Size</div>
            <div class="col-type">Type</div>
            <div class="col-modified">Modified</div>
            <div class="col-owner">Owner</div>
            <div class="col-actions">Actions</div>
          </div>
          <div v-for="item in filesStore.filteredItems" :key="item.id" class="list-item"
            @dblclick="openItem(item, $event)">
            <div class="col-name">
              <div class="name-content">
                <i :class="getFileIcon(item)"></i>
                <span class="name-text">{{ item.name }}</span>
                <i v-if="item.isLink" class="fas fa-link link-indicator"></i>
              </div>
            </div>
            <div class="col-size">
              {{ item.isFolder ? '-' : formatFileSize(item.size || 0) }}
            </div>
            <div class="col-type">
              {{ item.isFolder ? 'Folder' : (item.extension || 'File') }}
            </div>
            <div class="col-modified">
              {{ formatDate(item.modifiedAt || item.createdAt) }}
            </div>
            <div class="col-owner">
              {{ item.owner || 'Unknown' }}
            </div>
            <div class="col-actions">
              <button @click.stop="showItemDetails(item)" class="action-btn" title="Details">
                <i class="fas fa-info-circle"></i>
              </button>
              <button v-if="!item.isFolder && !item.isLink" @click.stop="downloadItem(item)" class="action-btn"
                title="Download">
                <i class="fas fa-download"></i>
              </button>
              <button @click.stop="deleteItem(item)" class="action-btn text-danger" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Drag Overlay -->
        <div v-if="isDragOver" class="drag-overlay">
          <div class="drag-content">
            <i class="fas fa-cloud-upload-alt"></i>
            <h3>Drop files here to upload</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <UploadModal v-if="showUploadModal" @close="showUploadModal = false" />
    <CreateFolderModal v-if="showCreateFolderModal" @close="showCreateFolderModal = false" />
    <UploadLinkModal v-if="showUploadLinkModal" @close="showUploadLinkModal = false" />
    <ItemDetailsModal 
      v-if="showDetailsModal" 
      :item="selectedItemForDetails" 
      @close="showDetailsModal = false"
      @edit="editItem"
    />
    <EditItemModal
      v-if="showEditModal"
      :item="editingItem"
      @close="showEditModal = false"
      @saved="handleItemUpdated"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useFilesStore } from '../stores/files'
import { useRouter, useRoute } from 'vue-router'
import UploadModal from '../components/modals/UploadModal.vue'
import CreateFolderModal from '../components/modals/CreateFolderModal.vue'
import UploadLinkModal from '../components/modals/UploadLinkModal.vue'
import ItemDetailsModal from '../components/modals/ItemDetailsModal.vue'
import EditItemModal from '../components/modals/EditItemModal.vue'
import Swal from 'sweetalert2'

export default {
  name: 'Explorer',
  components: {
    UploadModal,
    CreateFolderModal,
    UploadLinkModal,
    ItemDetailsModal,
    EditItemModal
  },
  setup() {
    const filesStore = useFilesStore()

    const breadcrumbs = computed(() => {
      const arr = filesStore.breadcrumbs || []
      if (!arr.length || arr[0]?.id !== 0) {
        return [{ id: 0, name: 'Home' }, ...arr]
      }
      // Ensure each item has a name fallback
      return arr.map((c, i) => ({ id: c.id, name: c.name || (i === 0 ? 'Home' : 'Folder') }))
    })

    const isDragOver = ref(false)
    const showUploadModal = ref(false)
    const showCreateFolderModal = ref(false)
    const showUploadLinkModal = ref(false)
    const showDetailsModal = ref(false)
    const showEditModal = ref(false)
    const selectedItemForDetails = ref(null)
    const editingItem = ref(null)

    const navigateToPath = async (id) => {
      if (id === filesStore.currentFolderId) return
      await filesStore.fetchFiles(id)
    }

    const handleSortChange = (event) => {
      filesStore.setSorting(event.target.value)
    }

    const toggleSortOrder = () => {
      const newOrder = filesStore.sortOrder === 'asc' ? 'desc' : 'asc'
      filesStore.setSorting(filesStore.sortBy, newOrder)
    }

    const openItem = async (item, event) => {
      event?.preventDefault()
      if (item.isFolder) {
        await filesStore.fetchFiles(item.id)
      } else if (item.isLink) {
        window.open(item.path, '_blank')
      } else {
        // For non-link files, trigger download on double click
        downloadItem(item)
      }
    }

    const handleDrop = async (event) => {
      event.preventDefault()
      event.stopPropagation()  // Prevent event from bubbling up
      isDragOver.value = false

      // Only process if we have files and no modal is open
      if (event.dataTransfer.files.length > 0 && !showUploadModal.value) {
        const files = Array.from(event.dataTransfer.files)
        await filesStore.uploadFiles(files)
      }
    }

    const downloadItem = async (item) => {
      if (item.isLink) {
        window.open(item.path, '_blank')
        return
      }

      try {
        const token = localStorage.getItem('token')
        const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/items/download/${item.id}`

        // Use fetch to get the file with authorization header
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error('Failed to download file')

        // Get the blob data
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        // Create a temporary anchor element
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', item.name)

        // Append to body, click and remove
        document.body.appendChild(link)
        link.click()

        // Cleanup
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)

      } catch (error) {
        console.error('Download failed:', error)
        await Swal.fire({
          icon: 'error',
          title: 'Download failed',
          text: 'Please try again.'
        })
      }
    }

    const deleteItem = async (item) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete "${item.name}". This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        try {
          await filesStore.deleteItems([item]);
          // await Swal.fire(
          //   'Deleted!',
          //   'Your file has been deleted.',
          //   'success'
          // );
        } catch (error) {
          console.error('Error deleting item:', error);
          await Swal.fire(
            'Error!',
            'There was an error deleting the file.',
            'error'
          );
        }
      }
    };

    const showItemDetails = (item) => {
      selectedItemForDetails.value = item
      showDetailsModal.value = true
    }

    const editItem = (item) => {
      editingItem.value = { ...item };
      showEditModal.value = true;
    };

    const handleItemUpdated = () => {
      // Refresh the file list to show the updated name
      filesStore.fetchFiles(filesStore.currentFolderId);
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return '0 B'
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getFileIcon = (item) => {
      if (item.isFolder) return 'fas fa-folder text-blue-500'
      if (item.isLink) return 'fas fa-link text-primary'

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

      return iconMap[item.extension] || 'fas fa-file text-gray-400'
    }

    onMounted(() => {
      filesStore.fetchFiles(0)
    })

    return {
      filesStore,
      breadcrumbs,
      isDragOver,
      showUploadModal,
      showCreateFolderModal,
      showUploadLinkModal,
      showDetailsModal,
      showEditModal,
      selectedItemForDetails,
      editingItem,
      navigateToPath,
      handleSortChange,
      toggleSortOrder,
      openItem,
      handleDrop,
      downloadItem,
      deleteItem,
      editItem,
      handleItemUpdated,
      showItemDetails,
      formatFileSize,
      formatDate,
      getFileIcon
    }
  }
}
</script>

<style scoped>
.explorer {
  padding: 2rem 0;
  min-height: calc(100vh - 70px);
}

.explorer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  overflow-x: auto;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.breadcrumb-item:hover {
  background-color: var(--background-color);
  color: var(--text-primary);
}

.breadcrumb-item.active {
  color: var(--primary-color);
  font-weight: 500;
}

.separator {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.toolbar-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-section {
  flex: 1;
  max-width: 400px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--surface-color);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sort-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--surface-color);
  font-size: 0.875rem;
}

.sort-order-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.sort-order-btn:hover {
  background: var(--background-color);
  color: var(--text-primary);
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.view-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.view-btn:hover,
.view-btn.active {
  background: var(--primary-color);
  color: white;
}

.file-area {
  position: relative;
  min-height: 400px;
  border: 2px dashed transparent;
  border-radius: var(--border-radius-lg);
  transition: all 0.3s ease;
}

.file-area.drag-over {
  border-color: var(--primary-color);
  background-color: rgba(59, 130, 246, 0.05);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.file-item {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.file-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.file-icon {
  position: relative;
  text-align: center;
  margin-bottom: 0.75rem;
}

.file-icon i {
  font-size: 2.5rem;
}

.link-indicator {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.file-info {
  text-align: center;
  margin-bottom: 0.75rem;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.file-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--background-color);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--primary-color);
  color: white;
}

.file-list {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr 100px;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-color);
  font-weight: 500;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.list-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.list-item:hover {
  background-color: var(--background-color);
}

.list-item:last-child {
  border-bottom: none;
}

.name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.1);
  border: 2px dashed var(--primary-color);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.drag-content {
  text-align: center;
  color: var(--primary-color);
}

.drag-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .explorer {
    padding: 1rem 0;
  }

  .explorer-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: stretch;
  }

  .toolbar-actions .btn {
    flex: 1;
  }

  .controls-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .view-controls {
    justify-content: space-between;
  }

  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .list-header,
  .list-item {
    grid-template-columns: 2fr 1fr 80px;
    gap: 0.5rem;
  }

  .col-size,
  .col-type,
  .col-owner {
    display: none;
  }
}

@media (max-width: 480px) {
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .breadcrumbs {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .breadcrumbs::-webkit-scrollbar {
    display: none;
  }
}
</style>
