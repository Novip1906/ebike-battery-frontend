import { type FC, useEffect } from 'react'
import { Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ConsumptionFilter } from '../components/ConsumptionFilter'
import { MotorModeCard } from '../components/MotorModeCard'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { deleteMotorMode, getMotorModesList, setMaxConsumptionWhPerKm } from '../store/motorModesSlice'

const MotorModesPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAppSelector((state) => state.rider)
  const { motorModes, maxConsumptionWhPerKm, consumptionMin, consumptionMax, loaded, loading, error } = useAppSelector(
    (state) => state.motorModes,
  )

  useEffect(() => {
    const request = dispatch(getMotorModesList())
    return () => request.abort()
  }, [dispatch, isAuthenticated])

  const handleCardClick = (id: number) => navigate(`${ROUTES.FEED}/${id}`)

  const handleDelete = async (id: number) => {
    const result = await dispatch(deleteMotorMode(id))
    if (deleteMotorMode.fulfilled.match(result)) dispatch(getMotorModesList())
  }

  return (
    <main className="grid-screen">
      <header>
        <h1 className="grid-screen__title">Режимы работы мотора</h1>
        <p className="grid-screen__subtitle">
          {isAuthenticated ? `Велосипедист ${login}` : 'Оценка времени разряда аккумулятора электровелосипеда'}
        </p>
      </header>

      {error && <Alert className="screen-error">{error}</Alert>}

      {consumptionMax > 0 && (
        <ConsumptionFilter
          value={maxConsumptionWhPerKm ?? consumptionMax}
          min={consumptionMin}
          max={consumptionMax}
          disabled={loading}
          onChange={(value) => dispatch(setMaxConsumptionWhPerKm(value))}
          onSearch={() => dispatch(getMotorModesList())}
        />
      )}

      <section className="mode-grid">
        {motorModes.map((motorMode) => (
          <MotorModeCard
            key={motorMode.id}
            motorMode={motorMode}
            onClick={handleCardClick}
            onDelete={isAuthenticated && motorMode.created_by_current_rider === 1 ? handleDelete : undefined}
            disabled={loading}
          />
        ))}
        {loaded && !loading && !error && motorModes.length === 0 && (
          <p className="mode-grid__empty">Режимов с таким расходом батареи не найдено.</p>
        )}
      </section>
    </main>
  )
}

export default MotorModesPage
