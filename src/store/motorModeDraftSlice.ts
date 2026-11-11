import { createSlice, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit'
import { api } from '../api'
import { isNotFound, rejectMessage, statusOf } from '../modules/errors'
import { toMotorModeDetail, type MotorModeDetail } from '../modules/motorModes'
import { createMotorModeThunk } from './hooks'
import { resetRider } from './riderSlice'

interface MotorModeDraftState {
  draft: MotorModeDetail | null
  pending: number
  loading: boolean
  error: string | null
}

const initialState: MotorModeDraftState = {
  draft: null,
  pending: 0,
  loading: false,
  error: null,
}

interface DraftCreateRequest {
  mode_name: string
  image: File
  video: File
}

interface DraftPublishRequest {
  motorModeId: number
  mode_name: string
  short_description: string
  support_percent: number
  consumption_wh_per_km: number
}

const reject = (error: unknown, fallback: string) => ({ guest: false, message: rejectMessage(error, fallback) })

export const getMotorModeDraft = createMotorModeThunk(
  'motorModeDraft/getMotorModeDraft',
  async (_, { rejectWithValue, signal }) => {
    try {
      const { data } = await api.motorModes.draftList({ signal })
      return toMotorModeDetail(data)
    } catch (error) {
      if (isNotFound(error)) return null
      return rejectWithValue(reject(error, 'Не удалось загрузить черновик режима.'))
    }
  },
)

export const createMotorModeDraft = createMotorModeThunk(
  'motorModeDraft/createMotorModeDraft',
  async (request: DraftCreateRequest, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.motorModes.motorModesCreate(request)
      return toMotorModeDetail(data)
    } catch (error) {
      if (statusOf(error) === 409) dispatch(getMotorModeDraft())
      return rejectWithValue(reject(error, 'Не удалось добавить режим работы мотора.'))
    }
  },
)

export const publishMotorModeDraft = createMotorModeThunk(
  'motorModeDraft/publishMotorModeDraft',
  async ({ motorModeId, ...motorMode }: DraftPublishRequest, { rejectWithValue }) => {
    try {
      const { data } = await api.motorModes.publishUpdate(motorModeId, motorMode)
      return toMotorModeDetail(data)
    } catch (error) {
      return rejectWithValue(reject(error, 'Не удалось опубликовать режим работы мотора.'))
    }
  },
)

export const deleteMotorModeDraft = createMotorModeThunk(
  'motorModeDraft/deleteMotorModeDraft',
  async (motorModeId: number, { rejectWithValue }) => {
    try {
      await api.motorModes.motorModesDelete(motorModeId)
      return motorModeId
    } catch (error) {
      return rejectWithValue(reject(error, 'Не удалось удалить черновик режима.'))
    }
  },
)

const draftThunks = [getMotorModeDraft, createMotorModeDraft, publishMotorModeDraft, deleteMotorModeDraft] as const

const motorModeDraftSlice = createSlice({
  name: 'motorModeDraft',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMotorModeDraft.fulfilled, (state, action) => {
        state.draft = action.payload
      })
      .addCase(createMotorModeDraft.fulfilled, (state, action) => {
        state.draft = action.payload
      })
      .addCase(publishMotorModeDraft.fulfilled, (state) => {
        state.draft = null
      })
      .addCase(deleteMotorModeDraft.fulfilled, (state) => {
        state.draft = null
      })
      .addCase(resetRider, () => initialState)
      .addMatcher(isPending(...draftThunks), (state) => {
        state.pending += 1
        state.loading = true
        state.error = null
      })
      .addMatcher(isFulfilled(...draftThunks), (state) => {
        state.pending = Math.max(state.pending - 1, 0)
        state.loading = state.pending > 0
      })
      .addMatcher(isRejected(...draftThunks), (state, action) => {
        state.pending = Math.max(state.pending - 1, 0)
        state.loading = state.pending > 0
        if (action.meta.aborted) return
        state.error = action.payload ? action.payload.message || null : 'Не удалось выполнить запрос.'
      })
  },
})

export default motorModeDraftSlice.reducer
