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

const consumptionOf = (motorMode: MotorModeCardData) => motorMode.consumption_wh_per_km ?? 0

export const getMotorModes = (maxConsumptionWhPerKm?: number): Promise<MotorModesResult> => {
  const consumptions = MOTOR_MODES_MOCK.map(consumptionOf)
  const consumptionMin = Math.min(...consumptions)
  const consumptionMax = Math.max(...consumptions)
  const max = maxConsumptionWhPerKm ?? consumptionMax
  const motorModes = MOTOR_MODES_MOCK.filter((motorMode) => consumptionOf(motorMode) <= max).map(
    ({ id, mode_name, image_url, support_percent, consumption_wh_per_km, like_count, created_by_current_rider }) => ({
      id,
      mode_name,
      image_url,
      support_percent,
      consumption_wh_per_km,
      like_count,
      created_by_current_rider,
    }),
  )
  return Promise.resolve({
    motor_modes: motorModes,
    max_consumption_wh_per_km: max,
    consumption_min: consumptionMin,
    consumption_max: consumptionMax,
  })
}

export const getMotorModeFeed = (motorModeId?: number, next = false): Promise<MotorModeDetail> => {
  if (motorModeId === undefined) return Promise.resolve(MOTOR_MODES_MOCK[0])
  const index = MOTOR_MODES_MOCK.findIndex((motorMode) => motorMode.id === motorModeId)
  if (index === -1) return Promise.reject(new Error('Режим не найден'))
  return Promise.resolve(next ? MOTOR_MODES_MOCK[(index + 1) % MOTOR_MODES_MOCK.length] : MOTOR_MODES_MOCK[index])
}
