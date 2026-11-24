import { readFileSync } from 'node:fs'
import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

const proxy: Record<string, ProxyOptions> = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
  '/minio': {
    target: 'http://localhost:9000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/minio/, ''),
  },
}

export default defineConfig(({ mode }) => {
  const pages = mode === 'pages'
  const lan = mode === 'lan'
  const server = {
    port: 4173,
    strictPort: true,
    host: lan ? '0.0.0.0' : 'localhost',
    https: lan ? {
      cert: readFileSync(new URL('./.certs/lan.pem', import.meta.url)),
      key: readFileSync(new URL('./.certs/lan-key.pem', import.meta.url)),
    } : undefined,
    proxy: pages ? undefined : proxy,
  }

  return {
    plugins: [react()],
    base: pages ? '/ebike-battery-frontend/' : '/',
    build: { outDir: pages ? 'dist-pages' : 'dist' },
    preview: server,
    server: {
      ...server,
      fs: { deny: ['.env', '.env.*', '*.{crt,cer,pem}', '**/.git/**', '**/.certs/**'] },
    },
  }
})
