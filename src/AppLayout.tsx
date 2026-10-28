import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { TabBar } from './components/TabBar'

export const AppLayout: FC = () => (
  <div className="screen">
    <Outlet />
    <TabBar />
  </div>
)
