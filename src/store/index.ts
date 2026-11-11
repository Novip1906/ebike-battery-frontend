import { configureStore } from '@reduxjs/toolkit'
import { api } from '../api'
import { statusOf } from '../modules/errors'
import { forgetAccessToken, isSessionToken } from '../modules/riderAuth'
import motorModeDraftReducer from './motorModeDraftSlice'
import motorModeFeedReducer from './motorModeFeedSlice'
import motorModesReducer from './motorModesSlice'
import riderReducer, { resetRider } from './riderSlice'

export const store = configureStore({
  reducer: {
    rider: riderReducer,
    motorModes: motorModesReducer,
    motorModeFeed: motorModeFeedReducer,
    motorModeDraft: motorModeDraftReducer,
  },
})

api.instance.interceptors.response.use(undefined, (error) => {
  if (statusOf(error) === 401 && isSessionToken(error.config?.headers?.Authorization)) {
    forgetAccessToken()
    store.dispatch(resetRider())
  }
  return Promise.reject(error)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
