<template>
  <div class="user-management">
    <div class="page-header">
      <h1>User Management</h1>
      <p class="page-description">
        Manage users, create new accounts, and assign admin privileges
      </p>
    </div>

    <!-- Actions Bar -->
    <div class="actions-bar">
      <button @click="showCreateUserModal = true" class="btn btn-primary">
        <i class="fas fa-user-plus"></i>
        Create New User
      </button>

      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input v-model="searchQuery" type="text" placeholder="Search users..." class="search-input">
        </div>

        <select v-model="roleFilter" class="filter-select">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">Regular User</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Fullname</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td class="user-info">
              <div class="user-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="user-details">
                <div class="user-name">{{ user.username }}</div>
              </div>
            </td>
            <td>{{ user.fullname }}</td>
            <td>
              <span :class="['role-badge', user.role]">
                <i :class="user.role === 'admin' ? 'fas fa-crown' : 'fas fa-user'"></i>
                {{ user.role === 'admin' ? 'Admin' : 'User' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button v-if="user.role !== 'admin'" @click="promoteUser(user)" class="btn btn-sm btn-outline"
                  title="Promote to Admin">
                  <i class="fas fa-arrow-up"></i>
                </button>
                <button v-if="user.role === 'admin' && user.id !== authStore.user.id" @click="demoteUser(user)"
                  class="btn btn-sm btn-outline" title="Demote to User">
                  <i class="fas fa-arrow-down"></i>
                </button>
                <button @click="editUser(user)" class="btn btn-sm btn-outline" title="Edit User">
                  <i class="fas fa-edit"></i>
                </button>
                <button v-if="user.id !== authStore.user.id" @click="deleteUser(user)" class="btn btn-sm btn-danger"
                  title="Delete User">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateUserModal" class="modal-overlay" @click="closeCreateUserModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New User</h3>
          <button @click="closeCreateUserModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="createUser">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input v-model="newUser.username" type="text" class="form-input" required>
            </div>

            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input v-model="newUser.fullname" type="text" class="form-input" required>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input v-model="newUser.password" type="password" class="form-input" required>
            </div>

            <div class="form-group">
              <label class="form-label">Role</label>
              <select v-model="newUser.role" class="form-input">
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button @click="closeCreateUserModal" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="createUser" class="btn btn-primary" :disabled="isCreating">
            <span v-if="isCreating" class="spinner"></span>
            {{ isCreating ? 'Creating...' : 'Create User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <EditUserModal
      v-if="showEditUserModal && selectedUser"
      :user="selectedUser"
      @close="showEditUserModal = false"
      @saved="handleUserUpdated"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../utils/axios'
import EditUserModal from '../components/modals/EditUserModal.vue'
import Swal from 'sweetalert2'

export default {
  components: {
    EditUserModal
  },
  setup() {
    const authStore = useAuthStore()

    const users = ref([])
    const searchQuery = ref('')
    const roleFilter = ref('')
    const showCreateUserModal = ref(false)
    const isCreating = ref(false)
    const showEditUserModal = ref(false)
    const selectedUser = ref(null)

    const newUser = ref({
      username: '',
      fullname: '',
      password: '',
      role: ''
    })

    const filteredUsers = computed(() => {
      let filtered = users.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user =>
          user.username.toLowerCase().includes(query) ||
          user.fullname.toLowerCase().includes(query)
        )
      }

      if (roleFilter.value) {
        filtered = filtered.filter(user => user.role === roleFilter.value)
      }

      return filtered
    })

    const formatDate = (dateString) => {
      if (!dateString) return 'Never'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const loadUsers = async () => {
      try {
        const response = await api.get('/auth/users')
        users.value = response.data.data
      } catch (error) {
        console.error('Error loading users:', error)
        alert('Failed to load users: ' + (error.response?.data?.message || error.message))
      }
    }

    const createUser = async () => {
      if (!newUser.value.username || !newUser.value.fullname || !newUser.value.password) {
        return
      }

      isCreating.value = true

      try {
        const response = await api.post('/auth/users', {
          username: newUser.value.username,
          fullname: newUser.value.fullname,
          password: newUser.value.password,
          role: newUser.value.role
        })

        users.value.push(response.data.data)
        closeCreateUserModal()
      } catch (error) {
        console.error('Create user error:', error)
        alert('Failed to create user: ' + (error.response?.data?.message || error.message))
      } finally {
        isCreating.value = false
      }
    }

    const promoteUser = async (user) => {
      const result = await Swal.fire({
        title: '🚀 Promote to Admin',
        html: `
          <div style="text-align: left; padding: 1rem 0;">
            <p style="margin-bottom: 1rem; color: #64748b;">You are about to promote:</p>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                  <i class="fas fa-user" style="font-size: 1.2rem;"></i>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${user.fullname || user.username}</div>
                  <div style="font-size: 0.875rem; color: #64748b;">@${user.username}</div>
                </div>
              </div>
            </div>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
              <div style="display: flex; gap: 0.5rem; align-items: start;">
                <i class="fas fa-crown" style="color: #f59e0b; margin-top: 0.2rem;"></i>
                <div style="font-size: 0.875rem; color: #92400e;">
                  <strong>Admin privileges include:</strong><br/>
                  • Full system access<br/>
                  • User management<br/>
                  • File management for all users
                </div>
              </div>
            </div>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0;">This action will grant administrative privileges to this user.</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-check"></i> Yes, Promote',
        cancelButtonText: '<i class="fas fa-times"></i> Cancel',
        customClass: {
          popup: 'swal2-popup-custom',
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom'
        },
        buttonsStyling: true,
        reverseButtons: true,
        focusCancel: true
      })

      if (result.isConfirmed) {
        try {
          const response = await api.put(`/auth/users/${user.id}`, {
            role: 'admin'
          })
          
          // Update local state
          user.role = 'admin'
          
          await Swal.fire({
            icon: 'success',
            title: 'Success!',
            html: `<strong>${user.fullname || user.username}</strong> has been promoted to admin.`,
            confirmButtonColor: '#10b981',
            timer: 2500,
            timerProgressBar: true
          })
        } catch (error) {
          console.error('Promote user error:', error)
          await Swal.fire({
            icon: 'error',
            title: 'Promotion Failed',
            text: error.response?.data?.message || error.message || 'Failed to promote user',
            confirmButtonColor: '#ef4444'
          })
        }
      }
    }

    const demoteUser = async (user) => {
      const result = await Swal.fire({
        title: '⬇️ Demote to Regular User',
        html: `
          <div style="text-align: left; padding: 1rem 0;">
            <p style="margin-bottom: 1rem; color: #64748b;">You are about to demote:</p>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                  <i class="fas fa-crown" style="font-size: 1.2rem;"></i>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${user.fullname || user.username}</div>
                  <div style="font-size: 0.875rem; color: #64748b;">@${user.username}</div>
                </div>
              </div>
            </div>
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
              <div style="display: flex; gap: 0.5rem; align-items: start;">
                <i class="fas fa-exclamation-triangle" style="color: #dc2626; margin-top: 0.2rem;"></i>
                <div style="font-size: 0.875rem; color: #7f1d1d;">
                  <strong>This will revoke:</strong><br/>
                  • Administrative privileges<br/>
                  • User management access<br/>
                  • System-wide file access
                </div>
              </div>
            </div>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0;">The user will be downgraded to a regular user account.</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-check"></i> Yes, Demote',
        cancelButtonText: '<i class="fas fa-times"></i> Cancel',
        customClass: {
          popup: 'swal2-popup-custom',
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom'
        },
        buttonsStyling: true,
        reverseButtons: true,
        focusCancel: true
      })

      if (result.isConfirmed) {
        try {
          const response = await api.put(`/auth/users/${user.id}`, {
            role: 'user'
          })
          
          // Update local state
          user.role = 'user'
          
          await Swal.fire({
            icon: 'success',
            title: 'Success!',
            html: `<strong>${user.fullname || user.username}</strong> has been demoted to regular user.`,
            confirmButtonColor: '#10b981',
            timer: 2500,
            timerProgressBar: true
          })
        } catch (error) {
          console.error('Demote user error:', error)
          await Swal.fire({
            icon: 'error',
            title: 'Demotion Failed',
            text: error.response?.data?.message || error.message || 'Failed to demote user',
            confirmButtonColor: '#ef4444'
          })
        }
      }
    }

    const editUser = (user) => {
      selectedUser.value = { ...user }
      showEditUserModal.value = true
    }

    const handleUserUpdated = async (updatedData) => {
      try {
        const response = await api.put(`/auth/users/${selectedUser.value.id}`, updatedData)
        const updatedUser = response.data.data
        
        // Update the user in the users list
        const index = users.value.findIndex(u => u.id === updatedUser.id)
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...updatedUser }
        }
        
        // Close the modal
        showEditUserModal.value = false
      } catch (error) {
        console.error('Update user error:', error)
        alert('Failed to update user: ' + (error.response?.data?.message || error.message))
      }
    }

    const deleteUser = async (user) => {
      const result = await Swal.fire({
        title: '🗑️ Delete User',
        html: `
          <div style="text-align: left; padding: 1rem 0;">
            <p style="margin-bottom: 1rem; color: #64748b;">You are about to permanently delete:</p>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                  <i class="fas fa-user" style="font-size: 1.2rem;"></i>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${user.fullname || user.username}</div>
                  <div style="font-size: 0.875rem; color: #64748b;">@${user.username}</div>
                </div>
              </div>
            </div>
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem;">
              <div style="display: flex; gap: 0.5rem; align-items: start;">
                <i class="fas fa-exclamation-circle" style="color: #dc2626; margin-top: 0.2rem;"></i>
                <div style="font-size: 0.875rem; color: #7f1d1d;">
                  <strong>Warning:</strong> This action cannot be undone.<br/>
                  All user data and files will be permanently deleted.
                </div>
              </div>
            </div>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0;">Are you absolutely sure you want to proceed?</p>
          </div>
        `,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fas fa-trash"></i> Yes, Delete',
        cancelButtonText: '<i class="fas fa-times"></i> Cancel',
        customClass: {
          popup: 'swal2-popup-custom',
          confirmButton: 'swal2-confirm-custom',
          cancelButton: 'swal2-cancel-custom'
        },
        buttonsStyling: true,
        reverseButtons: true,
        focusCancel: true
      })

      if (result.isConfirmed) {
        try {
          await api.delete(`/auth/users/${user.id}`)
          
          // Remove from local state
          const index = users.value.findIndex(u => u.id === user.id)
          if (index > -1) {
            users.value.splice(index, 1)
          }
          
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            html: `User <strong>${user.fullname || user.username}</strong> has been deleted.`,
            confirmButtonColor: '#10b981',
            timer: 2500,
            timerProgressBar: true
          })
        } catch (error) {
          console.error('Delete user error:', error)
          await Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: error.response?.data?.message || error.message || 'Failed to delete user',
            confirmButtonColor: '#ef4444'
          })
        }
      }
    }

    const closeCreateUserModal = () => {
      showCreateUserModal.value = false
      newUser.value = {
        fullname: '',
        username: '',
        password: '',
        role: 'user'
      }
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      authStore,
      users,
      searchQuery,
      roleFilter,
      showCreateUserModal,
      isCreating,
      showEditUserModal,
      selectedUser,
      newUser,
      filteredUsers,
      formatDate,
      createUser,
      promoteUser,
      demoteUser,
      editUser,
      handleUserUpdated,
      deleteUser,
      closeCreateUserModal
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 2rem;
  max-width: 1200px;
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

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--surface-color);
  color: var(--text-primary);
  min-width: 250px;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--surface-color);
  color: var(--text-primary);
}

.users-table-container {
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: var(--background-color);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.user-username {
  font-size: 0.875rem;
  color: var(--text-muted);
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

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: var(--success-color);
  color: white;
}

.status-badge.inactive {
  background: var(--text-muted);
  color: white;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-management {
    padding: 1rem;
  }

  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-filters {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
    width: 100%;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    min-width: 800px;
  }

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

/* SweetAlert2 Custom Styles */
:deep(.swal2-popup-custom) {
  border-radius: 16px;
  padding: 0;
}

:deep(.swal2-popup-custom .swal2-title) {
  font-size: 1.5rem;
  font-weight: 600;
  padding: 1.5rem 1.5rem 0.5rem;
}

:deep(.swal2-popup-custom .swal2-html-container) {
  margin: 0;
  padding: 0 1.5rem 1.5rem;
}

:deep(.swal2-confirm-custom),
:deep(.swal2-cancel-custom) {
  padding: 0.625rem 1.5rem !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
  font-size: 0.9375rem !important;
  transition: all 0.2s ease !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

:deep(.swal2-confirm-custom:hover),
:deep(.swal2-cancel-custom:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

:deep(.swal2-confirm-custom:active),
:deep(.swal2-cancel-custom:active) {
  transform: translateY(0);
}

:deep(.swal2-popup-custom .swal2-icon) {
  margin: 1.5rem auto 1rem;
}
</style>
