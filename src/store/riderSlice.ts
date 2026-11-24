import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Rider } from '../modules/riderAuth'

interface RiderState {
  login: string
  isAuthenticated: boolean
  authPending: boolean
}

const initialState: RiderState = {
  login: '',
  isAuthenticated: false,
  authPending: false,
}

const riderSlice = createSlice({
  name: 'rider',
  initialState,
  reducers: {
    setAuthPending(state, action: PayloadAction<boolean>) {
      state.authPending = action.payload
    },
    setRider(state, action: PayloadAction<Rider>) {
      state.login = action.payload.login
      state.isAuthenticated = true
      state.authPending = false
    },
    resetRider() {
      return initialState
    },
  },
})

export const { setRider, resetRider, setAuthPending } = riderSlice.actions
export default riderSlice.reducer
