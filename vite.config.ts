import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 部署在自有服务器 /calendar/ 子路径；本地开发 vite 会自动处理 base
export default defineConfig({
  base: '/calendar/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
