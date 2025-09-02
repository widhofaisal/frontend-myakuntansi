# Vue 3 Dialog System

A modern, accessible, and customizable dialog system for Vue 3 applications. This package provides a set of components and utilities to replace the native browser dialogs (`alert`, `confirm`, `prompt`) with beautiful, responsive modals.

## Features

- 🎨 Modern, clean UI with smooth animations
- 🌓 Built-in dark mode support
- 📱 Fully responsive design
- ♿ Accessible (keyboard navigation, screen reader support)
- 🔄 Promise-based API
- 🎭 Customizable appearance and behavior
- 🔌 Easy to use with Vue 3 Composition API or Options API
- 🔄 Replace native browser dialogs (optional)

## Installation

The dialog system is already set up in your project. You can start using it right away.

## Usage

### Basic Usage

#### Alert

```javascript
import { alert } from '@/utils/dialogs';

// Basic alert
alert('This is an alert message');

// With options
alert('Action completed successfully!', {
  title: 'Success',
  confirmText: 'Got it!',
  size: 'sm' // 'sm' | 'md' | 'lg'
});
```

#### Confirm

```javascript
import { confirm } from '@/utils/dialogs';

// Basic confirm
const confirmed = await confirm('Are you sure you want to delete this item?');
if (confirmed) {
  // Proceed with deletion
}

// With options
const confirmed = await confirm('This action cannot be undone. Continue?', {
  title: 'Warning',
  confirmText: 'Yes, delete it',
  cancelText: 'No, keep it',
  size: 'md'
});
```

#### Prompt

```javascript
import { prompt } from '@/utils/dialogs';

// Basic prompt
const name = await prompt('Please enter your name:');
if (name !== null) {
  console.log(`Hello, ${name}!`);
}

// With options
const email = await prompt('Enter your email:', 'user@example.com', {
  title: 'Contact Information',
  placeholder: 'your.email@example.com',
  confirmText: 'Submit',
  cancelText: 'Cancel',
  size: 'md'
});
```

### Status Dialogs

```javascript
import { success, error, warning } from '@/utils/dialogs';

// Success dialog
await success('Your changes have been saved successfully!');

// Error dialog
await error('Failed to save changes. Please try again.');

// Warning dialog
await warning('This action cannot be undone.');
```

### Using in Components

#### Composition API

```vue
<template>
  <button @click="showDeleteConfirmation">Delete Item</button>
</template>

<script setup>
import { confirm, alert } from '@/utils/dialogs';

const showDeleteConfirmation = async () => {
  const confirmed = await confirm('Are you sure you want to delete this item?');
  if (confirmed) {
    // Delete the item
    await alert('Item deleted successfully!');
  }
};
</script>
```

#### Options API

```vue
<template>
  <button @click="showDeleteConfirmation">Delete Item</button>
</template>

<script>
import { confirm, alert } from '@/utils/dialogs';

export default {
  methods: {
    async showDeleteConfirmation() {
      const confirmed = await confirm('Are you sure you want to delete this item?');
      if (confirmed) {
        // Delete the item
        await alert('Item deleted successfully!');
      }
    }
  }
};
</script>
```

## API Reference

### Dialog Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `'Alert'` | Dialog title |
| `message` | `string` | `''` | Dialog message (only for alert/confirm) |
| `confirmText` | `string` | `'OK'` | Text for confirm button |
| `cancelText` | `string` | `'Cancel'` | Text for cancel button |
| `closeOnOverlay` | `boolean` | `true` for alert, `false` for confirm/prompt | Close dialog when clicking outside |
| `closeOnEscape` | `boolean` | `true` | Close dialog when pressing ESC key |
| `showCloseButton` | `boolean` | `true` | Show close button in header |
| `size` | `'sm' | 'md' | 'lg'` | `'sm'` | Dialog size |
| `placeholder` | `string` | `''` | Input placeholder (only for prompt) |

### Methods

#### `alert(message, options)`
Shows an alert dialog.

#### `confirm(message, options)`
Shows a confirmation dialog. Returns a promise that resolves to `true` if confirmed, `false` if cancelled.

#### `prompt(message, defaultValue, options)`
Shows a prompt dialog. Returns a promise that resolves to the input value if confirmed, `null` if cancelled.

#### `success(message, options)`
Shows a success dialog.

#### `error(message, options)`
Shows an error dialog.

#### `warning(message, options)`
Shows a warning dialog.

## Customization

You can customize the appearance by modifying the styles in `Modal.vue`. The component uses Tailwind CSS for styling, but you can replace it with your preferred CSS solution.

## Accessibility

The dialog system is built with accessibility in mind:

- Proper ARIA attributes for screen readers
- Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Focus management
- Proper heading structure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE 11 (with polyfills)

## Demo

See the `DialogDemo.vue` component for a live demo of all available dialog types and options.

## License

MIT
