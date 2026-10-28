import { type FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConsumptionFilter } from '../components/ConsumptionFilter'
import { MotorModeCard } from '../components/MotorModeCard'
import { getMotorModes, type MotorModeCardData } from '../modules/motorModes'
import { ROUTES } from '../Routes'

const MotorModesPage: FC = () => {
  const [motorModes, setMotorModes] = useState<MotorModeCardData[]>([])
  const [consumptionRange, setConsumptionRange] = useState({ min: 0, max: 0 })
  const [maxConsumption, setMaxConsumption] = useState(0)
  const [searchConsumption, setSearchConsumption] = useState<number>()
  const navigate = useNavigate()

  useEffect(() => {
    getMotorModes(searchConsumption).then((result) => {
      setMotorModes(result.motor_modes)
      setConsumptionRange({ min: result.consumption_min, max: result.consumption_max })
      setMaxConsumption(result.max_consumption_wh_per_km)
    })
  }, [searchConsumption])

  const handleCardClick = (id: number) => navigate(`${ROUTES.FEED}/${id}`)

  return (
    <main className="grid-screen">
      <header>
        <h1 className="grid-screen__title">Режимы работы мотора</h1>
        <p className="grid-screen__subtitle">Оценка времени разряда аккумулятора электровелосипеда</p>
      </header>

      {consumptionRange.max > 0 && (
        <ConsumptionFilter
          value={maxConsumption}
          min={consumptionRange.min}
          max={consumptionRange.max}
          onChange={setMaxConsumption}
          onSearch={() => setSearchConsumption(maxConsumption)}
        />
      )}

      <section className="mode-grid">
        {motorModes.map((motorMode) => (
          <MotorModeCard key={motorMode.id} motorMode={motorMode} onClick={handleCardClick} />
        ))}
        {motorModes.length === 0 && <p className="mode-grid__empty">Режимов с таким расходом батареи не найдено.</p>}
      </section>
    </main>
  )
}

export default MotorModesPage
