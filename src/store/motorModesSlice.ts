import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../api'
import { errorMessage, isBackendUnavailable, rejectMessage } from '../modules/errors'
import { motorModesMock, toMotorModesResult, type MotorModeCardData, type MotorModesResult } from '../modules/motorModes'
import { createMotorModeThunk } from './hooks'
import { resetRider } from './riderSlice'

interface MotorModesState {
  maxConsumptionWhPerKm: number | null
  motorModes: MotorModeCardData[]
  consumptionMin: number
  consumptionMax: number
  loaded: boolean
  loading: boolean
  requestId: string | null
  error: string | null
}

const initialState: MotorModesState = {
  maxConsumptionWhPerKm: null,
  motorModes: [],
  consumptionMin: 0,
  consumptionMax: 0,
  loaded: false,
  loading: false,
  requestId: null,
  error: null,
}

export const getMotorModesList = createMotorModeThunk(
  'motorModes/getMotorModesList',
  async (_, { getState, rejectWithValue, signal }) => {
    const { motorModes, rider } = getState()
    const max = motorModes.maxConsumptionWhPerKm
    try {
      const { data } = await api.motorModes.motorModesList(
        max === null || max >= motorModes.consumptionMax ? undefined : { max_consumption_wh_per_km: max },
        { signal },
      )
      return toMotorModesResult(data)
    } catch (error) {
      return rejectWithValue({
        guest: !rider.isAuthenticated && isBackendUnavailable(error),
        message: errorMessage(error, 'Не удалось загрузить режимы работы мотора.'),
      })
    }
  },
)

export const deleteMotorMode = createMotorModeThunk(
  'motorModes/deleteMotorMode',
  async (motorModeId: number, { rejectWithValue }) => {
    try {
      await api.motorModes.motorModesDelete(motorModeId)
      return motorModeId
    } catch (error) {
      return rejectWithValue({ guest: false, message: rejectMessage(error, 'Не удалось удалить режим работы мотора.') })
    }
  },
)

const applyMotorModes = (state: MotorModesState, result: MotorModesResult) => {
  state.motorModes = result.motor_modes
  state.consumptionMin = result.consumption_min
  state.consumptionMax = result.consumption_max
  if (state.maxConsumptionWhPerKm !== null) state.maxConsumptionWhPerKm = result.max_consumption_wh_per_km
}

const motorModesSlice = createSlice({
  name: 'motorModes',
  initialState,
  reducers: {
    setMaxConsumptionWhPerKm(state, action: PayloadAction<number>) {
      state.maxConsumptionWhPerKm = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMotorModesList.pending, (state, action) => {
        state.loading = true
        state.requestId = action.meta.requestId
        state.error = null
      })
      .addCase(getMotorModesList.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.loading = false
        state.requestId = null
        state.loaded = true
        applyMotorModes(state, action.payload)
      })
      .addCase(getMotorModesList.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.loading = false
        state.requestId = null
        if (action.meta.aborted) return
        state.loaded = true
        if (action.payload?.guest) {
          applyMotorModes(state, motorModesMock(state.maxConsumptionWhPerKm))
        } else {
          state.motorModes = []
          state.error = action.payload?.message ?? 'Не удалось загрузить режимы работы мотора.'
        }
      })
      .addCase(deleteMotorMode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMotorMode.rejected, (state, action) => {
        if (state.requestId === null) state.loading = false
        if (action.payload?.message) state.error = action.payload.message
      })
      .addCase(resetRider, (state) => {
        state.maxConsumptionWhPerKm = null
      })
  },
})

export const { setMaxConsumptionWhPerKm } = motorModesSlice.actions
export default motorModesSlice.reducer
