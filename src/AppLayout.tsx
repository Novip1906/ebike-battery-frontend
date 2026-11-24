import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { LoadingOverlay } from './components/LoadingOverlay'
import { TabBar } from './components/TabBar'
import { useAppSelector } from './store/hooks'

export const AppLayout: FC = () => {
  const loading = useAppSelector(
    (state) => state.motorModes.loading || state.motorModeFeed.loading || state.motorModeDraft.loading,
  )

  return (
    <div className="screen" aria-busy={loading}>
      <div inert={loading}>
        <Outlet />
        <TabBar />
      </div>
      <LoadingOverlay show={loading} />
    </div>
  )
}
