import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import React from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [React(), tailwindcss()],
})
