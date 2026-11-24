import type { FC } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from './Routes'
import { AppLayout } from './AppLayout'
import MotorModesPage from './pages/MotorModesPage'
import MotorModeFeedPage from './pages/MotorModeFeedPage'
import MotorModeDraftPage from './pages/MotorModeDraftPage'
import RiderLoginPage from './pages/RiderLoginPage'
import { PAGES_MOCK } from './modules/pages'

const Router = PAGES_MOCK ? HashRouter : BrowserRouter

const App: FC = () => (
  <Router>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to={ROUTES.GRID} replace />} />
        <Route path={ROUTES.GRID} element={<MotorModesPage />} />
        <Route path={ROUTES.FEED} element={<MotorModeFeedPage />} />
        <Route path={`${ROUTES.FEED}/:motorModeId`} element={<MotorModeFeedPage />} />
        {!PAGES_MOCK && (
          <>
            <Route path={ROUTES.DRAFT} element={<MotorModeDraftPage />} />
            <Route path={ROUTES.LOGIN} element={<RiderLoginPage />} />
          </>
        )}
        <Route path="*" element={<Navigate to={ROUTES.GRID} replace />} />
      </Route>
    </Routes>
  </Router>
)

export default App
