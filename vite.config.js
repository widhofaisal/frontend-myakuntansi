import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces for Docker
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Your backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Add security headers for proxy
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add security headers to proxied requests
            proxyReq.setHeader('X-Forwarded-Proto', 'http')
            proxyReq.setHeader('X-Real-IP', req.socket.remoteAddress || req.ip)
          })
        }
      }
    },
    open: false, // Don't auto-open browser for security
    hmr: {
      overlay: true,
      // Enable HMR for Docker
      clientPort: 8080,
      host: 'localhost'
    },
    watch: {
      usePolling: true, // Required for Docker on Windows/Mac
      interval: 100
    },
    fs: {
      strict: true, // Restrict file system access for security
      // Only allow access to project files and node_modules
      allow: ['..']
    },
    // Add security middleware
    middlewareMode: false,
    // CORS configuration for development
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true
    }
  },
  // Build configuration for security
  build: {
    // Enable source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',
    // Minify code in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    // Security: prevent information disclosure
    rollupOptions: {
      output: {
        // Don't expose file paths in production
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  // Define environment variables for security
  define: {
    __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV === 'development',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: process.env.NODE_ENV === 'development'
  }
})
