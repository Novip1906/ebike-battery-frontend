const scope = new URL(self.registration.scope)
const prefix = `ebike-battery:${scope.pathname}:`
const cacheName = prefix + self.precache.version
const indexUrl = new URL('index.html', scope).href
const files = new Set(self.precache.files.map((file) => new URL(file, scope).href))

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    await cache.addAll(Array.from(files, (url) => new Request(url, { cache: 'reload' })))
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.startsWith(prefix) && name !== cacheName).map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

async function rangeResponse(response, range) {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim())
  if (!match || (!match[1] && !match[2])) return response

  const body = await response.blob()
  const last = body.size - 1
  const start = match[1] ? Number(match[1]) : Math.max(0, body.size - Number(match[2]))
  const end = match[1] && match[2] ? Math.min(Number(match[2]), last) : last
  const headers = new Headers({ 'Accept-Ranges': 'bytes' })

  if (start > end) {
    headers.set('Content-Range', `bytes */${body.size}`)
    return new Response(null, { status: 416, headers })
  }

  const slice = body.slice(start, end + 1, response.headers.get('Content-Type') || 'video/mp4')
  headers.set('Content-Range', `bytes ${start}-${end}/${body.size}`)
  headers.set('Content-Length', String(slice.size))
  return new Response(slice, { status: 206, headers })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== scope.origin) return

  const resource = url.pathname === scope.pathname ? indexUrl : url.origin + url.pathname
  if (!files.has(resource)) return

  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    const response = await cache.match(resource)
    if (!response) return fetch(request)

    const range = request.headers.get('range')
    return range && resource.endsWith('.mp4') ? rangeResponse(response, range) : response
  })())
})
