<template>
  <div class="dashboard">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your file management system</p>
        </div>
        <div class="header-actions">
          <button @click="refreshData" class="btn btn-secondary" :disabled="filesStore.isLoading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': filesStore.isLoading }"></i>
            Refresh
          </button>
          <router-link to="/explorer" class="btn btn-primary">
            <i class="fas fa-folder-open"></i>
            Go to Explorer
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon folders">
            <i class="fas fa-folder"></i>
          </div>
          <div class="stat-content">
            <h3>{{ filesStore.stats.totalFolders }}</h3>
            <p>Total Folders</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon files">
            <i class="fas fa-file"></i>
          </div>
          <div class="stat-content">
            <h3>{{ filesStore.stats.totalFiles }}</h3>
            <p>Total Files</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon storage">
            <i class="fas fa-hdd"></i>
          </div>
          <div class="stat-content">
            <h3>{{ storageInGB }}</h3>
            <p>Storage Used</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon links">
            <i class="fas fa-link"></i>
          </div>
          <div class="stat-content">
            <h3>{{ filesStore.stats.totalLinks || 0 }}</h3>
            <p>Total Links</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon users">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>{{ filesStore.stats.totalUsers }}</h3>
            <p>Active Users</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <div class="card">
            <div class="card-header">
              <h3>Files by Extension</h3>
              <div class="chart-controls">
                <button 
                  @click="chartType = 'doughnut'" 
                  class="chart-btn"
                  :class="{ active: chartType === 'doughnut' }"
                >
                  <i class="fas fa-chart-pie"></i>
                </button>
                <button 
                  @click="chartType = 'bar'" 
                  class="chart-btn"
                  :class="{ active: chartType === 'bar' }"
                >
                  <i class="fas fa-chart-bar"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <FileExtensionChart 
                :data="filesStore.stats.filesByExtension" 
                :type="chartType"
              />
            </div>
          </div>
        </div>

        <!-- <div class="chart-container">
          <div class="card">
            <div class="card-header">
              <h3>Upload Activity</h3>
              <select v-model="activityPeriod" class="period-select">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>
            <div class="card-body">
              <UploadActivityChart :period="activityPeriod" />
            </div>
          </div>
        </div> -->
      </div>

      <!-- Recent Activity -->
      <!-- <div class="recent-activity">
        <div class="card">
          <div class="card-header">
            <h3>Recent Activity</h3>
            <router-link to="/explorer" class="view-all-link">
              View All <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="recentFiles.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No recent activity</p>
            </div>
            <div v-else class="activity-list">
              <div 
                v-for="file in recentFiles" 
                :key="file.id" 
                class="activity-item"
              >
                <div class="activity-icon">
                  <i :class="getFileIcon(file)"></i>
                </div>
                <div class="activity-content">
                  <h4>{{ file.name }}</h4>
                  <p>
                    {{ file.action }} by {{ file.owner }} • 
                    {{ formatDate(file.modifiedAt) }}
                  </p>
                </div>
                <div class="activity-meta">
                  <span v-if="file.size" class="file-size">
                    {{ formatFileSize(file.size) }}
                  </span>
                  <span v-if="file.isLink" class="link-badge">
                    <i class="fas fa-link"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Quick Actions -->
      <!-- <div class="quick-actions">
        <div class="card">
          <div class="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div class="card-body">
            <div class="actions-grid">
              <router-link to="/explorer" class="action-item">
                <div class="action-icon">
                  <i class="fas fa-upload"></i>
                </div>
                <div class="action-content">
                  <h4>Upload Files</h4>
                  <p>Add new files to your archive</p>
                </div>
              </router-link>
              
              <router-link to="/explorer" class="action-item">
                <div class="action-icon">
                  <i class="fas fa-folder-plus"></i>
                </div>
                <div class="action-content">
                  <h4>Create Folder</h4>
                  <p>Organize your files with folders</p>
                </div>
              </router-link>
              
              <router-link v-if="authStore.isAdmin" to="/users" class="action-item">
                <div class="action-icon">
                  <i class="fas fa-user-plus"></i>
                </div>
                <div class="action-content">
                  <h4>Manage Users</h4>
                  <p>Add or modify user accounts</p>
                </div>
              </router-link>
              
              <router-link to="/profile" class="action-item">
                <div class="action-icon">
                  <i class="fas fa-cog"></i>
                </div>
                <div class="action-content">
                  <h4>Settings</h4>
                  <p>Update your profile and preferences</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/auth'
import { useFilesStore } from '../stores/files'
import FileExtensionChart from '../components/charts/FileExtensionChart.vue'
import UploadActivityChart from '../components/charts/UploadActivityChart.vue'

export default {
  name: 'Dashboard',
  components: {
    FileExtensionChart,
    UploadActivityChart
  },
  setup() {
    const authStore = useAuthStore()
    const filesStore = useFilesStore()
    
    const chartType = ref('doughnut')
    const activityPeriod = ref('7')
    
    const totalStorage = computed(() => {
      // Mock calculation - in real app, this would come from API
      return 2.5 * 1024 * 1024 * 1024 // 2.5 GB
    })
    
    const totalUsers = computed(() => {
      // Mock data - in real app, this would come from API
      return authStore.isAdmin ? 12 : 1
    })
    
    const recentFiles = computed(() => {
      // Mock recent activity data
      return [
        {
          id: 1,
          name: 'Project Report.pdf',
          action: 'Uploaded',
          owner: 'John Doe',
          modifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          size: 2048576,
          extension: 'PDF',
          isLink: false
        },
        {
          id: 2,
          name: 'Meeting Notes.docx',
          action: 'Modified',
          owner: 'Jane Smith',
          modifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          size: 524288,
          extension: 'DOCX',
          isLink: false
        },
        {
          id: 3,
          name: 'Google Drive Link',
          action: 'Added',
          owner: 'Admin User',
          modifiedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          isLink: true
        }
      ]
    })
    
    const storageInGB = computed(() => {
      const bytes = parseFloat(filesStore.stats.totalStorageUsed);
      if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
      } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
      } else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
      }
    })

    const refreshData = async () => {
      try {
        await filesStore.fetchStats()
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Dashboard has been refreshed',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: 'var(--surface-color)',
          color: 'var(--text-primary)',
        })
      } catch (error) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Failed to refresh data',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: 'var(--surface-color)',
          color: 'var(--text-primary)',
        })
      }
    }
    
    const formatStorage = (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      if (bytes === 0) return '0 Bytes'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }
    
    const formatFileSize = (bytes) => {
      return formatStorage(bytes)
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours}h ago`
      if (diffInHours < 48) return 'Yesterday'
      return date.toLocaleDateString()
    }
    
    const getFileIcon = (file) => {
      if (file.isLink) return 'fas fa-link text-primary'
      
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
      
      return iconMap[file.extension] || 'fas fa-file text-gray-400'
    }
    
    onMounted(() => {
      // Use nextTick to ensure the component is fully mounted before fetching data
      // This prevents store operations from interfering with navigation
      setTimeout(() => {
        filesStore.fetchStats().catch(error => {
          console.warn('Failed to fetch stats:', error)
        })
      }, 100)
    })
    
    return {
      authStore,
      filesStore,
      chartType,
      activityPeriod,
      totalStorage,
      totalUsers,
      recentFiles,
      storageInGB,
      refreshData,
      formatStorage,
      formatFileSize,
      formatDate,
      getFileIcon
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem 0;
  min-height: calc(100vh - 70px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-header h1 {
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.folders {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.files {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.storage {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.users {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.links {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.stat-content p {
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-container {
  min-height: 400px;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
}

.chart-btn:hover,
.chart-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.period-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--surface-color);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.recent-activity,
.quick-actions {
  margin-bottom: 2rem;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: var(--primary-dark);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: var(--background-color);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius);
  background: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.activity-content p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.file-size {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.link-badge {
  padding: 0.25rem 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
  border-radius: var(--border-radius-sm);
  font-size: 0.7rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.action-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius);
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.action-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.action-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem 0;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .chart-container {
    min-height: 300px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .activity-meta {
    align-self: stretch;
    justify-content: space-between;
  }
}
</style>
