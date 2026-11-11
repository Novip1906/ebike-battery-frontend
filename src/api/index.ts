import { Api } from './Api'

export const api = new Api<string>({
  baseURL: '/api',
  secure: true,
  securityWorker: (accessToken) => (accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {}),
})
