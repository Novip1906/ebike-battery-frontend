import { readFileSync } from 'node:fs'
import { defineConfig, type PreviewServer, type ProxyOptions, type ViteDevServer } from 'vite'
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

function allowLocalConnections(server: ViteDevServer | PreviewServer) {
  server.httpServer?.prependListener('connection', (socket) => {
    if (!socket.remoteAddress?.startsWith('127.')) socket.destroy()
  })
}

export default defineConfig(({ mode }) => {
  const pages = mode === 'pages'
  const lan = mode === 'lan'
  const server = {
    port: 4173,
    strictPort: true,
    host: '0.0.0.0',
    https: lan ? {
      cert: readFileSync(new URL('./.certs/lan.pem', import.meta.url)),
      key: readFileSync(new URL('./.certs/lan-key.pem', import.meta.url)),
    } : undefined,
    proxy: pages ? undefined : proxy,
  }

  return {
    plugins: [
      react(),
      !lan && {
        name: 'localhost-only',
        configureServer: allowLocalConnections,
        configurePreviewServer: allowLocalConnections,
      },
    ],
    base: pages ? '/ebike-battery-frontend/' : '/',
    cacheDir: `node_modules/.vite/${mode}`,
    build: { outDir: pages ? 'dist-pages' : 'dist' },
    preview: server,
    server: {
      ...server,
      watch: { ignored: ['**/dist-pages/**'] },
      fs: { deny: ['.env', '.env.*', '*.{crt,cer,pem}', '**/.git/**', '**/.certs/**'] },
    },
  }
})
