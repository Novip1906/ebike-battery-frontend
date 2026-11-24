import axios from 'axios'
import { api, backendOptions } from '../api'

export const ACCESS_TOKEN_KEY = 'rider_access_token'

export interface Rider {
  id: number
  login: string
}

interface RiderLoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  rider: Rider
}

let sessionToken: string | null = null
const riderHttp = axios.create(backendOptions)

export const isSessionToken = (authorization: unknown) =>
  sessionToken !== null && authorization === `Bearer ${sessionToken}`

export const forgetAccessToken = () => {
  if (localStorage.getItem(ACCESS_TOKEN_KEY) === sessionToken) localStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionToken = null
  api.setSecurityData(null)
}

export const loginRider = async (login: string, password: string): Promise<Rider> => {
  const { data } = await riderHttp.post<RiderLoginResponse>('/riders/login', { login, password })
  sessionToken = data.access_token
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
  api.setSecurityData(data.access_token)
  return data.rider
}

export const logoutRider = async () => {
  const accessToken = sessionToken
  forgetAccessToken()
  if (accessToken) {
    await riderHttp.post('/riders/logout', null, { headers: { Authorization: `Bearer ${accessToken}` } })
  }
}
