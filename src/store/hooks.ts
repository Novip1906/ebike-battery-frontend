import { createAsyncThunk } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '.'

export interface MotorModeRejectValue {
  guest: boolean
  message: string
}

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const createMotorModeThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  rejectValue: MotorModeRejectValue
}>()
