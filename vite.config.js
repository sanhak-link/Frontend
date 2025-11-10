// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,        // 프론트 개발 포트
    open: true,        // 자동으로 브라우저 오픈
    proxy: {
      // 프론트에서 /api/* 로 호출하면 Vite가 백엔드(8080)로 프록시
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: false,     
        headers: {     
          Connection: 'keep-alive'
        },
      },
    },
  },
})
