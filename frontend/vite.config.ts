import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Roufit — 루틴 & 체지방 트래커',
        short_name: 'Roufit',
        description: '매일의 루틴과 체중/체지방 변화를 기록하는 개인용 트래커',
        theme_color: '#101314',
        background_color: '#101314',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
})
