import type { FC, FormEvent } from 'react'
import { Button, Form } from 'react-bootstrap'

interface Props {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  onSearch: () => void
}

const TICKS = 5

export const ConsumptionFilter: FC<Props> = ({ value, min, max, onChange, onSearch }) => {
  const ticks = Array.from({ length: TICKS }, (_, i) => min + ((max - min) * i) / (TICKS - 1))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <Form className="filter" onSubmit={handleSubmit}>
      <Form.Label className="field__label" htmlFor="maxConsumptionWhPerKm">
        Расход батареи не более {value} Вт·ч/км
      </Form.Label>
      <Form.Range
        id="maxConsumptionWhPerKm"
        className="slider"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="slider__scale">
        {ticks.map((tick) => (
          <span key={tick} className="slider__tick" style={{ left: `${((tick - min) / (max - min)) * 100}%` }}>
            {tick.toFixed(1)}
          </span>
        ))}
      </div>
      <Button type="submit" className="button button--primary button--wide">
        Найти
      </Button>
    </Form>
  )
}
