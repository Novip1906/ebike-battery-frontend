import { randomBytes, X509Certificate } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { isIPv4 } from 'node:net'
import { networkInterfaces } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const interfaces = Object.entries(networkInterfaces())
  .filter(([name]) => !/^(lo|utun|veth|bridge|docker|tun|tap)/.test(name))
  .flatMap(([, addresses]) => addresses.filter(({ family, internal }) => family === 'IPv4' && !internal))
const address = process.argv[2] ?? interfaces[0]?.address
if (!address || !isIPv4(address)) {
  throw new Error('Укажите IPv4 ноутбука в Wi-Fi: npm run cert:lan -- 192.168.1.10')
}

process.umask(0o077)
const dir = fileURLToPath(new URL('../.certs/', import.meta.url))
mkdirSync(dir, { recursive: true, mode: 0o700 })
const temporary = mkdtempSync(join(dir, 'issue-'))
const ca = join(dir, 'ca.pem')
const caKey = join(dir, 'ca-key.pem')
const openssl = (...args) => execFileSync('openssl', args, { cwd: temporary, stdio: ['ignore', 'ignore', 'pipe'] })

try {
  if (existsSync(ca) !== existsSync(caKey)) throw new Error('Для подписи нужна полная пара .certs/ca.pem и ca-key.pem.')
  if (!existsSync(ca)) {
    writeFileSync(join(temporary, 'ca.cnf'), [
      '[req]', 'distinguished_name=dn', 'prompt=no', 'x509_extensions=ca', '[dn]',
      'CN=eBike Lab Local CA', '[ca]', 'basicConstraints=critical,CA:TRUE,pathlen:0',
      'keyUsage=critical,keyCertSign,cRLSign', 'subjectKeyIdentifier=hash',
    ].join('\n'))
    openssl('req', '-new', '-x509', '-newkey', 'rsa:3072', '-nodes', '-sha256',
      '-days', '730', '-config', 'ca.cnf', '-keyout', 'ca-key.pem', '-out', 'ca.pem')
    renameSync(join(temporary, 'ca-key.pem'), caKey)
    renameSync(join(temporary, 'ca.pem'), ca)
  }

  writeFileSync(join(temporary, 'lan.ext'), [
    'basicConstraints=critical,CA:FALSE', 'keyUsage=critical,digitalSignature,keyEncipherment',
    'extendedKeyUsage=serverAuth', 'authorityKeyIdentifier=keyid,issuer',
    `subjectAltName=IP:${address},IP:127.0.0.1,IP:::1,DNS:localhost`,
  ].join('\n'))
  openssl('req', '-new', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-subj', '/CN=eBike Lab',
    '-keyout', 'lan-key.pem', '-out', 'lan.csr')
  openssl('x509', '-req', '-in', 'lan.csr', '-CA', ca, '-CAkey', caKey,
    '-set_serial', `0x${randomBytes(16).toString('hex')}`, '-days', '90', '-sha256',
    '-extfile', 'lan.ext', '-out', 'lan.pem')
  openssl('verify', '-CAfile', ca, 'lan.pem')
  openssl('x509', '-in', ca, '-outform', 'DER', '-out', 'ebike-ca.cer')
  for (const file of ['lan-key.pem', 'lan.pem', 'ebike-ca.cer']) renameSync(join(temporary, file), join(dir, file))
  const certificate = new X509Certificate(readFileSync(ca))
  console.log(`Адрес в Wi-Fi: https://${address}:4173\nСертификат для телефона: .certs/ebike-ca.cer\nSHA-256 центра: ${certificate.fingerprint256}`)
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
