import type { SerializerMotorModeCard, SerializerMotorModeDetail, SerializerMotorModeList } from '../api/Api'
import { MOTOR_MODES_MOCK } from './mock'

export interface MotorModeCardData {
  id: number
  mode_name: string
  image_url: string
  support_percent: number | null
  consumption_wh_per_km: number | null
  like_count: number
  created_by_current_rider: number
}

export interface MotorModesResult {
  motor_modes: MotorModeCardData[]
  max_consumption_wh_per_km: number
  consumption_min: number
  consumption_max: number
}

export interface MotorModeDetail extends MotorModeCardData {
  status: string
  liked_by_current_rider: number
  creator_rider_id: number
  video_url: string
  range_km: number
  short_description: string | null
  created_at: string
  published_at: string | null
}

export const DEFAULT_IMAGE = `${import.meta.env.BASE_URL}default_motor_modes.jpg`
export const DEFAULT_VIDEO = `${import.meta.env.BASE_URL}default_motor_modes.mp4`

const MINIO_PROXY = '/minio'

export const minioProxyUrl = (url?: string | null) => (url ? url.replace(/^https?:\/\/[^/]+/, MINIO_PROXY) : '')

const toMotorModeCard = (card: SerializerMotorModeCard): MotorModeCardData => ({
  id: card.id ?? 0,
  mode_name: card.mode_name ?? '',
  image_url: minioProxyUrl(card.image_url),
  support_percent: card.support_percent ?? null,
  consumption_wh_per_km: card.consumption_wh_per_km ?? null,
  like_count: card.like_count ?? 0,
  created_by_current_rider: card.created_by_current_rider ?? 0,
})

export const toMotorModesResult = (list: SerializerMotorModeList): MotorModesResult => ({
  motor_modes: (list.motor_modes ?? []).map(toMotorModeCard),
  max_consumption_wh_per_km: list.max_consumption_wh_per_km ?? 0,
  consumption_min: list.consumption_min ?? 0,
  consumption_max: list.consumption_max ?? 0,
})

export const toMotorModeDetail = (detail: SerializerMotorModeDetail): MotorModeDetail => ({
  ...toMotorModeCard(detail),
  status: detail.status ?? '',
  liked_by_current_rider: detail.liked_by_current_rider ?? 0,
  creator_rider_id: detail.creator_rider_id ?? 0,
  video_url: minioProxyUrl(detail.video_url),
  range_km: detail.range_km ?? 0,
  short_description: detail.short_description ?? null,
  created_at: detail.created_at ?? '',
  published_at: detail.published_at ?? null,
})

const consumptionOf = (motorMode: MotorModeCardData) => motorMode.consumption_wh_per_km ?? 0

const mockCard = ({
  id,
  mode_name,
  image_url,
  support_percent,
  consumption_wh_per_km,
  like_count,
  created_by_current_rider,
}: MotorModeDetail): MotorModeCardData => ({
  id,
  mode_name,
  image_url,
  support_percent,
  consumption_wh_per_km,
  like_count,
  created_by_current_rider,
})

export const motorModesMock = (maxConsumptionWhPerKm: number | null): MotorModesResult => {
  const consumptions = MOTOR_MODES_MOCK.map(consumptionOf)
  const consumptionMin = Math.min(...consumptions)
  const consumptionMax = Math.ceil(Math.max(...consumptions))
  const max = Math.max(consumptionMin, Math.min(maxConsumptionWhPerKm ?? consumptionMax, consumptionMax))
  return {
    motor_modes: MOTOR_MODES_MOCK.filter((motorMode) => consumptionOf(motorMode) <= max).map(mockCard),
    max_consumption_wh_per_km: max,
    consumption_min: consumptionMin,
    consumption_max: consumptionMax,
  }
}

export const motorModeFeedMock = (motorModeId?: number, next = false): MotorModeDetail | null => {
  if (motorModeId === undefined) return MOTOR_MODES_MOCK[0]
  const index = MOTOR_MODES_MOCK.findIndex((motorMode) => motorMode.id === motorModeId)
  if (index === -1) return null
  return MOTOR_MODES_MOCK[next ? (index + 1) % MOTOR_MODES_MOCK.length : index]
}
