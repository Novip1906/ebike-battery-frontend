import type { FC } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from './Routes'
import { AppLayout } from './AppLayout'
import MotorModesPage from './pages/MotorModesPage'
import MotorModeFeedPage from './pages/MotorModeFeedPage'

const App: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to={ROUTES.GRID} replace />} />
        <Route path={ROUTES.GRID} element={<MotorModesPage />} />
        <Route path={ROUTES.FEED} element={<MotorModeFeedPage />} />
        <Route path={`${ROUTES.FEED}/:motorModeId`} element={<MotorModeFeedPage />} />
        <Route path="*" element={null} />
      </Route>
    </Routes>
  </BrowserRouter>
)

export default App
