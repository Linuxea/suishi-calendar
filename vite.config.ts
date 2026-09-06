import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 若部署到服务器子路径（如 /calendar/），需同步修改 base
export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
