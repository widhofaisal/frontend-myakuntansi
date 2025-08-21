import { defineStore } from 'pinia'
import axios from 'axios'

export const useFilesStore = defineStore('files', {
  state: () => ({
    currentPath: '/',
    currentFolderId: 0,
    breadcrumbItems: [],  
    files: [],
    folders: [],
    selectedItems: [],
    viewMode: 'grid', // 'grid' or 'list'
    sortBy: 'name', // 'name', 'date', 'type', 'size'
    sortOrder: 'asc', // 'asc' or 'desc'
    searchQuery: '',
    isLoading: false,
    uploadProgress: 0,
    isUploading: false,
    stats: {
      totalFolders: 0,
      totalFiles: 0,
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
      // This is a basic implementation - you'll need to populate breadcrumbItems
      // from your API response or maintain it in the state
      return [
        { id: 0, name: 'Home' },
        ...(state.breadcrumbItems || [])
      ]
    }
  },

  actions: {
    async fetchFiles(id = 0) {
      this.isLoading = true
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/items_and_folders/${id}`
        )

        this.currentFolderId = id
        this.currentPath = response.data.data?.currentPath || '/'
        this.folders = response.data.data.folders || []
        this.files = response.data.data.files || []
        this.breadcrumbItems = response.data.data.breadcrumbs || []
    

        // If your API returns breadcrumb information, update it here
        // Example: this.breadcrumbItems = response.data.data.breadcrumbs || []

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
        // Mock stats for demo - removed HTTP request to prevent navigation interference
        await new Promise(resolve => setTimeout(resolve, 100)) // Simulate brief loading

        this.stats = {
          totalFolders: 15,
          totalFiles: 127,
          filesByExtension: {
            'PDF': 45,
            'DOCX': 23,
            'MP4': 12,
            'JPG': 31,
            'PNG': 16
          }
        }

        return { success: true }
      } catch (error) {
        console.error('Fetch stats error:', error)
        return { success: false }
      }
    },

    async createFolder(name, path = this.currentPath) {
      try {
        // Mock folder creation - removed HTTP request to prevent navigation interference
        await new Promise(resolve => setTimeout(resolve, 100)) // Simulate brief loading

        // Mock: Add folder to current list
        const newFolder = {
          id: Date.now(),
          name,
          isFolder: true,
          path: path + '/' + name,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          owner: 'Current User'
        }

        this.folders.push(newFolder)

        return { success: true }
      } catch (error) {
        console.error('Create folder error:', error)
        return { success: false, message: 'Failed to create folder' }
      }
    },

    async uploadFiles(files, overwrite = false) {
      this.uploadProgress = 0
      this.isUploading = true

      try {
        // Mock file upload with progress
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            this.uploadProgress = Math.round(((i * 100) + progress) / files.length)
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          // Add file to store
          const newFile = {
            id: Date.now() + i,
            name: file.name,
            isFolder: false,
            size: file.size,
            type: 'file',
            extension: file.name.split('.').pop()?.toLowerCase() || '',
            mimeType: file.type,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            owner: 'Current User',
            isLink: false
          }

          this.files.push(newFile)
        }

        return { success: true, message: 'Files uploaded successfully' }
      } catch (error) {
        console.error('Upload error:', error)
        return { success: false, message: 'Upload failed' }
      } finally {
        this.isUploading = false
        this.uploadProgress = 0
      }
    },

    async uploadLink(url, name) {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const newLink = {
          id: Date.now(),
          name: name,
          isFolder: false,
          url: url,
          type: 'link',
          extension: 'LINK',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          owner: 'Current User',
          isLink: true
        }

        this.files.push(newLink)
        return { success: true, message: 'Link added successfully' }
      } catch (error) {
        console.error('Upload link error:', error)
        return { success: false, message: 'Failed to add link' }
      }
    },

    async deleteItems(items) {
      this.isLoading = true
      try {
        // Replace with actual API endpoint
        await axios.delete('https://api.example.com/items', { data: { items } })

        // Mock: Remove items from lists
        items.forEach(item => {
          if (item.isFolder) {
            this.folders = this.folders.filter(f => f.id !== item.id)
          } else {
            this.files = this.files.filter(f => f.id !== item.id)
          }
        })

        this.selectedItems = []

        return { success: true }
      } catch (error) {
        console.error('Delete error:', error)
        return { success: false, message: 'Failed to delete items' }
      } finally {
        this.isLoading = false
      }
    },

    setViewMode(mode) {
      this.viewMode = mode
    },

    setSorting(sortBy, sortOrder = null) {
      if (this.sortBy === sortBy && !sortOrder) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = sortBy
        this.sortOrder = sortOrder || 'asc'
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

    generateMockData(path) {
      // Generate mock folders and files for demo
      const folders = [
        {
          id: 1,
          name: 'Documents',
          isFolder: true,
          path: path + '/Documents',
          createdAt: '2024-01-15T10:30:00Z',
          modifiedAt: '2024-01-20T14:22:00Z',
          owner: 'John Doe'
        },
        {
          id: 2,
          name: 'Images',
          isFolder: true,
          path: path + '/Images',
          createdAt: '2024-01-10T09:15:00Z',
          modifiedAt: '2024-01-25T16:45:00Z',
          owner: 'Jane Smith'
        },
        {
          id: 3,
          name: 'Videos',
          isFolder: true,
          path: path + '/Videos',
          createdAt: '2024-01-05T11:20:00Z',
          modifiedAt: '2024-01-22T13:30:00Z',
          owner: 'Admin User'
        }
      ]

      const files = [
        {
          id: 4,
          name: 'Project Report.pdf',
          isFolder: false,
          size: 2048576,
          type: 'application/pdf',
          extension: 'PDF',
          createdAt: '2024-01-18T14:30:00Z',
          modifiedAt: '2024-01-19T09:15:00Z',
          owner: 'John Doe',
          isLink: false
        },
        {
          id: 5,
          name: 'Meeting Notes.docx',
          isFolder: false,
          size: 524288,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          extension: 'DOCX',
          createdAt: '2024-01-17T16:45:00Z',
          modifiedAt: '2024-01-17T16:45:00Z',
          owner: 'Jane Smith',
          isLink: false
        },
        {
          id: 6,
          name: 'Google Docs Link',
          isFolder: false,
          url: 'https://docs.google.com/document/d/example',
          type: 'link',
          extension: 'LINK',
          createdAt: '2024-01-16T12:00:00Z',
          modifiedAt: '2024-01-16T12:00:00Z',
          owner: 'Admin User',
          isLink: true
        }
      ]

      return { folders, files }
    }
  }
})
