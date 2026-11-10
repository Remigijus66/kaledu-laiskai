import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' leidžia talpinti GitHub Pages bet kuriame repozitorijos kelyje
export default defineConfig({
  base: './',
  plugins: [react()],
})
