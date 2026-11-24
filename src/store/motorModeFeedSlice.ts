import { createSlice } from '@reduxjs/toolkit'
import { api } from '../api'
import { isBackendUnavailable, rejectMessage } from '../modules/errors'
import { motorModeFeedMock, toMotorModeDetail, type MotorModeDetail } from '../modules/motorModes'
import { PAGES_MOCK } from '../modules/pages'
import { createMotorModeThunk } from './hooks'
import { resetRider } from './riderSlice'

interface MotorModeFeedState {
  motorMode: MotorModeDetail | null
  loading: boolean
  requestId: string | null
  error: string | null
}

const initialState: MotorModeFeedState = {
  motorMode: null,
  loading: false,
  requestId: null,
  error: null,
}

interface FeedRequest {
  motorModeId?: number
  next?: boolean
}

interface LikeRequest {
  motorModeId: number
  like: 0 | 1
}

const NOT_FOUND = 'Режим работы мотора не найден.'

export const getMotorModeFeed = createMotorModeThunk(
  'motorModeFeed/getMotorModeFeed',
  async ({ motorModeId, next = false }: FeedRequest, { getState, rejectWithValue, signal }) => {
    if (PAGES_MOCK) {
      return motorModeFeedMock(motorModeId, next) ?? rejectWithValue({ guest: false, message: NOT_FOUND })
    }
    try {
      const { data } =
        motorModeId === undefined
          ? await api.motorModes.feedList({ signal })
          : await api.motorModes.feedDetail(motorModeId, next ? { next: true } : undefined, { signal })
      return toMotorModeDetail(data)
    } catch (error) {
      return rejectWithValue({
        guest: !getState().rider.isAuthenticated && isBackendUnavailable(error),
        message: rejectMessage(error, 'Не удалось загрузить режим работы мотора.'),
      })
    }
  },
)

export const likeMotorMode = createMotorModeThunk(
  'motorModeFeed/likeMotorMode',
  async ({ motorModeId, like }: LikeRequest, { rejectWithValue }) => {
    try {
      const { data } = await api.motorModes.likeCreate(motorModeId, { like })
      return {
        motorModeId: data.motor_mode_id ?? motorModeId,
        likeCount: data.like_count ?? 0,
        likedByCurrentRider: data.liked_by_current_rider ?? like,
      }
    } catch (error) {
      return rejectWithValue({ guest: false, message: rejectMessage(error, 'Не удалось поставить лайк.') })
    }
  },
)

const motorModeFeedSlice = createSlice({
  name: 'motorModeFeed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMotorModeFeed.pending, (state, action) => {
        const { motorModeId, next } = action.meta.arg
        state.loading = true
        state.requestId = action.meta.requestId
        state.error = null
        if (!next && motorModeId !== state.motorMode?.id) state.motorMode = null
      })
      .addCase(getMotorModeFeed.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.loading = false
        state.motorMode = action.payload
      })
      .addCase(getMotorModeFeed.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.loading = false
        if (action.meta.aborted) return
        const { motorModeId, next } = action.meta.arg
        const mock = action.payload?.guest
          ? (motorModeFeedMock(motorModeId, next) ?? (next ? motorModeFeedMock() : null))
          : null
        if (mock || !next) state.motorMode = mock
        if (!mock) state.error = action.payload?.guest ? NOT_FOUND : (action.payload?.message ?? NOT_FOUND) || null
      })
      .addCase(likeMotorMode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(likeMotorMode.fulfilled, (state, action) => {
        state.loading = false
        if (state.motorMode?.id === action.payload.motorModeId) {
          state.motorMode.like_count = action.payload.likeCount
          state.motorMode.liked_by_current_rider = action.payload.likedByCurrentRider
        }
      })
      .addCase(likeMotorMode.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || null
      })
      .addCase(resetRider, (state) => {
        state.loading = false
        state.error = null
        if (state.motorMode) {
          state.motorMode.liked_by_current_rider = 0
          state.motorMode.created_by_current_rider = 0
        }
      })
  },
})

export default motorModeFeedSlice.reducer
