import type { FC } from 'react'
import { Spinner } from 'react-bootstrap'

interface Props {
  show: boolean
}

export const LoadingOverlay: FC<Props> = ({ show }) =>
  show ? (
    <div className="loading-overlay" role="status" aria-label="Загрузка">
      <Spinner animation="border" className="loading-overlay__spinner" />
    </div>
  ) : null
