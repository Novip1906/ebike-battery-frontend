import { Api } from './Api'
import { PAGES_MOCK } from '../modules/pages'

export const backendOptions = {
  baseURL: '/api',
  adapter: PAGES_MOCK
    ? () => Promise.reject(new Error('Для этого действия требуется подключение к веб-сервису.'))
    : undefined,
}

export const api = new Api<string>({
  ...backendOptions,
  secure: true,
  securityWorker: (accessToken) => (accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}),
})
