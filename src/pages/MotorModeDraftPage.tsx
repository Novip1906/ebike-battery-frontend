import { type FC, useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { Navigate } from 'react-router-dom'
import { MotorModeDraftForm } from '../components/MotorModeDraftForm'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getMotorModeDraft } from '../store/motorModeDraftSlice'

const MotorModeDraftPage: FC = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.rider.isAuthenticated)
  const { draft, loading, error } = useAppSelector((state) => state.motorModeDraft)
  const [openedByRider] = useState(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return
    const request = dispatch(getMotorModeDraft())
    return () => request.abort()
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return openedByRider ? <Navigate to={ROUTES.GRID} replace /> : <Navigate to={ROUTES.LOGIN} replace state={{ from: ROUTES.DRAFT }} />
  }

  return (
    <main className="draft">
      <header className="draft__header">
        <h1 className="draft__title">{draft ? `Черновик режима «${draft.mode_name}»` : 'Новый режим работы мотора'}</h1>
      </header>

      {error && <Alert className="screen-error">{error}</Alert>}

      <MotorModeDraftForm key={draft?.id ?? 'new'} draft={draft} loading={loading} />
    </main>
  )
}

export default MotorModeDraftPage
