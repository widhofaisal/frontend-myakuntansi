<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Rename {{ item.isFolder ? 'Folder' : 'File' }}</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label :for="'name-' + item.id">
            {{ item.isFolder ? 'Folder' : 'File' }} Name
          </label>
          <input
            :id="'name-' + item.id"
            v-model="newName"
            type="text"
            class="form-control"
            @keyup.enter="saveChanges"
            ref="nameInput"
          >
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancel
        </button>
        <button 
          @click="saveChanges" 
          class="btn btn-primary"
          :disabled="isSaving || !isFormValid"
        >
          <span v-if="isSaving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, computed } from 'vue';
import { useFilesStore } from '../../stores/files';

export default {
  name: 'EditItemModal',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const filesStore = useFilesStore();
    const newName = ref(props.item.name);
    const isSaving = ref(false);
    const error = ref('');
    const nameInput = ref(null);

    const isFormValid = computed(() => {
      return newName.value.trim() !== '' && newName.value !== props.item.name;
    });

    const saveChanges = async () => {
      if (!isFormValid.value) return;
      
      isSaving.value = true;
      error.value = '';
      
      try {
        await filesStore.renameItem({
          id: props.item.id,
          name: newName.value.trim(),
          type: props.item.type
        });
        
        emit('saved');
        emit('close');
      } catch (err) {
        console.error('Error renaming item:', err);
        error.value = err.response?.data?.message || 'Failed to rename item. Please try again.';
      } finally {
        isSaving.value = false;
      }
    };

    // Focus the input when the modal opens
    onMounted(() => {
      if (nameInput.value) {
        const input = nameInput.value;
        // Select the text without extension for easier renaming
        const lastDotIndex = input.value.lastIndexOf('.');
        if (lastDotIndex > 0) {
          input.setSelectionRange(0, lastDotIndex);
        } else {
          input.select();
        }
        input.focus();
      }
    });

    return {
      newName,
      isSaving,
      error,
      nameInput,
      isFormValid,
      saveChanges
    };
  }
};
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
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.error-message {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: -0.125em;
  border: 0.15em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
</style>
