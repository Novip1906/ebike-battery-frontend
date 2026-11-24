import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const output = fileURLToPath(new URL('../dist-pages/', import.meta.url))
const worker = await readFile(new URL('./service-worker.js', import.meta.url), 'utf8')
const entries = await readdir(output, { recursive: true, withFileTypes: true })
const files = entries
  .filter((entry) => entry.isFile())
  .map((entry) => relative(output, join(entry.parentPath, entry.name)).split(sep).join('/'))
  .filter((file) => file !== 'service-worker.js' && !file.split('/').some((part) => part.startsWith('.')))
  .sort()

const hash = createHash('sha256').update(worker)
for (const file of files) {
  hash.update(file).update('\0').update(await readFile(join(output, file))).update('\0')
}
const version = hash.digest('hex').slice(0, 20)
const precache = JSON.stringify({ version, files })
await writeFile(join(output, 'service-worker.js'), `self.precache = ${precache}\n${worker}`)
