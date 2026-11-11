import { isAxiosError } from 'axios'

export const errorMessage = (error: unknown, fallback: string) =>
  (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) || fallback

export const statusOf = (error: unknown) => (isAxiosError(error) ? error.response?.status : undefined)

export const rejectMessage = (error: unknown, fallback: string) =>
  statusOf(error) === 401 ? '' : errorMessage(error, fallback)

export const isNotFound = (error: unknown) => statusOf(error) === 404

export const isBackendUnavailable = (error: unknown) => {
  const status = statusOf(error)
  return status === undefined || status >= 500
}
