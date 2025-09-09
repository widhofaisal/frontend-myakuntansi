import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import api from '../utils/axios'

export const useFilesStore = defineStore('files', {
  state: () => ({
    currentPath: '/',
    currentFolderId: 0,
    breadcrumbItems: [],
    files: [],
    folders: [],
    selectedItems: [],
    viewMode: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    searchQuery: '',
    isLoading: false,
    uploadProgress: 0,
    isUploading: false,
    stats: {
      totalFolders: 0,
      totalFiles: 0,
      totalStorageUsed: 0,
      totalUsers: 0,
      totalLinks: 0,
      filesByExtension: {}
    }
  }),

  getters: {
    filteredItems: (state) => {
      let items = [...state.folders, ...state.files]

      // Apply search filter
      if (state.searchQuery) {
        items = items.filter(item =>
          item.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      }

      // Apply sorting
      items.sort((a, b) => {
        let aValue, bValue

        switch (state.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'date':
            aValue = new Date(a.modifiedAt || a.createdAt)
            bValue = new Date(b.modifiedAt || b.createdAt)
            break
          case 'type':
            aValue = a.type || (a.isFolder ? 'folder' : 'file')
            bValue = b.type || (b.isFolder ? 'folder' : 'file')
            break
          case 'size':
            aValue = a.size || 0
            bValue = b.size || 0
            break
          default:
            return 0
        }

        if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1
        return 0
      })

      return items
    },

    breadcrumbs: (state) => {
      return state.breadcrumbItems
    }
  },

  actions: {
    async fetchFiles(id = 0) {
      this.isLoading = true
      try {
        const response = await api.get(`/auth/items_and_folders/${id}`)

        this.currentFolderId = id
        this.currentPath = response.data.data?.currentPath || '/'
        this.folders = response.data.data.folders || []
        this.files = response.data.data.files || []
        this.breadcrumbItems = response.data.data.breadcrumbs || []

        return { success: true }
      } catch (error) {
        console.error('Fetch files error:', error)
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to load files'
        }
      } finally {
        this.isLoading = false
      }
    },

    async fetchStats() {
      try {
        const response = await api.get('/auth/stats')
        this.stats = response.data.data
        return { success: true }
      } catch (error) {
        console.error('Fetch stats error:', error)
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to load statistics'
        }
      }
    },

    async createFolder(name, parentId = this.currentFolderId) {
      const toast = useToast()
      try {
        const response = await api.post('/auth/folder', {
          name,
          parentId: parentId
        })

        this.folders.push(response.data.data)

        // Show success toast
        toast.success(`Folder "${name}" created successfully`)

        return { success: true, message: 'Folder created successfully' }
      } catch (error) {
        console.error('Create folder error:', error)
        const errorMessage = error.response?.data?.error || 'Failed to create folder'

        // Show error toast
        toast.error(errorMessage)

        return {
          success: false,
          message: errorMessage
        }
      }
    },

    async uploadFiles(fileList, overwrite = false) {
      const toast = useToast()
      this.uploadProgress = 0
      this.isUploading = true

      try {
        const formData = new FormData()
        const filesArray = Array.from(fileList || [])
        filesArray.forEach(file => {
          formData.append('file', file)
        })
        formData.append('parentId', this.currentFolderId)
        formData.append('overwrite', overwrite)

        const response = await api.post('/auth/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
          }
        })

        // Check if response.data exists and handle the response structure
        if (!response.data) {
          throw new Error('No data received from server')
        }

        // Handle both array and single file response
        const newFiles = Array.isArray(response.data)
          ? response.data
          : response.data.data
            ? Array.isArray(response.data.data)
              ? response.data.data
              : [response.data.data]
            : [response.data]

        // Add new file(s) to the current list
        this.files = [...this.files, ...newFiles]

        // Show success toast
        const fileCount = filesArray.length
        toast.success(`Successfully uploaded ${fileCount} ${fileCount === 1 ? 'file' : 'files'}`)

        return { success: true, message: 'Files uploaded successfully' }
      } catch (error) {
        console.error('Upload error:', error)
        const errorMessage = error.response?.data?.error || 'Upload failed'

        // Show error toast
        toast.error(errorMessage)

        return {
          success: false,
          message: errorMessage
        }
      } finally {
        this.isUploading = false
        this.uploadProgress = 0
      }
    },

    async uploadLink(url, name) {
      try {
        const response = await api.post('/auth/link', {
          filePath: url,
          name,
          parentId: this.currentFolderId
        })

        this.files.push(response.data.data)
        return { success: true, message: 'Link added successfully' }
      } catch (error) {
        console.error('Upload link error:', error)
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to add link'
        }
      }
    },

    async deleteItems(items) {
      const toast = useToast()
      this.isLoading = true

      try {
        await Promise.all(
          items.map(item =>
            api.delete(`/auth/items/${item.id}`)
          )
        )

        // Remove deleted items from the state
        const itemIds = items.map(item => item.id)
        this.files = this.files.filter(file => !itemIds.includes(file.id))
        this.folders = this.folders.filter(folder => !itemIds.includes(folder.id))

        // Show success toast
        const itemType = items.length > 1 ? 'items' : items[0].isFolder ? 'folder' : 'file'
        toast.success(`Successfully deleted ${items.length} ${itemType}${items.length > 1 ? 's' : ''}`)

        return { success: true, message: 'Items deleted successfully' }
      } catch (error) {
        console.error('Delete error:', error)
        const errorMessage = error.response?.data?.error || 'Failed to delete items'

        // Show error toast
        toast.error(errorMessage)

        return {
          success: false,
          message: errorMessage
        }
      } finally {
        this.isLoading = false
      }
    },

    async renameItem({ id, name, type }) {
      try {
        const response = await api.put(`/auth/items/${id}`, { name });

        // Update the item in the state
        const index = this.files.findIndex(f => f.id === id);
        if (index !== -1) {
          this.files[index] = { ...this.files[index], name };
        }

        return { success: true, message: 'Item renamed successfully' };
      } catch (error) {
        console.error('Rename error:', error);
        throw error; // Re-throw to let the component handle the error
      }
    },

    setViewMode(mode) {
      this.viewMode = mode
    },

    setSorting(sortBy, sortOrder = null) {
      this.sortBy = sortBy
      if (sortOrder) {
        this.sortOrder = sortOrder
      } else {
        // Toggle if same sortBy, otherwise default to asc
        this.sortOrder = this.sortBy === sortBy
          ? this.sortOrder === 'asc' ? 'desc' : 'asc'
          : 'asc'
      }
    },

    setSearchQuery(query) {
      this.searchQuery = query
    },

    toggleItemSelection(item) {
      const index = this.selectedItems.findIndex(i => i.id === item.id)
      if (index > -1) {
        this.selectedItems.splice(index, 1)
      } else {
        this.selectedItems.push(item)
      }
    },

    clearSelection() {
      this.selectedItems = []
    },

    // Helper method for development
    generateMockData() {
      // This is a mock data generator for development
      // Remove in production or when API is fully implemented
      const mockFolders = [
        {
          id: 1,
          name: 'Documents',
          isFolder: true,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          owner: 'Current User'
        },
        {
          id: 2,
          name: 'Images',
          isFolder: true,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          owner: 'Current User'
        }
      ]

      const mockFiles = [
        {
          id: 101,
          name: 'example.pdf',
          isFolder: false,
          size: 1024 * 1024 * 2.5, // 2.5MB
          type: 'application/pdf',
          extension: 'pdf',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          owner: 'Current User'
        }
      ]

      this.folders = mockFolders
      this.files = mockFiles
    }
  }
})
