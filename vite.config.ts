import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    reactRouter(),
    tailwindcss(),
    tsconfigPaths()
  ],
  
  // Performance optimizations
  build: {
    // Enable code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate large dependencies into their own chunks
          'pdf-lib': ['pdfjs-dist'],
          'ai-lib': ['@google/generative-ai'],
          'supabase': ['@supabase/supabase-js'],
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'ui-vendor': ['react-dropzone']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for better debugging
    sourcemap: false, // Disable in production for better performance
    // Minify for smaller bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  
  // Development optimizations
  server: {
    // Enable HMR for faster development
    hmr: true
  },
  
  // Optimize dependency resolution
  optimizeDeps: {
    // Pre-bundle large dependencies
    include: [
      'react',
      'react-dom',
      'react-router',
      '@supabase/supabase-js',
      'react-dropzone',
      'zustand'
    ],
    // Exclude heavy dependencies that should be lazy loaded
    exclude: [
      'pdfjs-dist',
      '@google/generative-ai'
    ]
  },
  
  // Enable experimental features for better performance
  esbuild: {
    // Drop console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});
