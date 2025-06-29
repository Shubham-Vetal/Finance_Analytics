import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist', // Required for Render static deployment
    sourcemap: false, // Optional: remove if you want production sourcemaps
  },
  server: {
    port: 5173, // Optional: keep default Vite dev port
  },
})
