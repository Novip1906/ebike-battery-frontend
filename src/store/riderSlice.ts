import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Rider } from '../modules/riderAuth'

interface RiderState {
  login: string
  isAuthenticated: boolean
}

const initialState: RiderState = {
  login: '',
  isAuthenticated: false,
}

const riderSlice = createSlice({
  name: 'rider',
  initialState,
  reducers: {
    setRider(state, action: PayloadAction<Rider>) {
      state.login = action.payload.login
      state.isAuthenticated = true
    },
    resetRider() {
      return initialState
    },
  },
})

export const { setRider, resetRider } = riderSlice.actions
export default riderSlice.reducer
