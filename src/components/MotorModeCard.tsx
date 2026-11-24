import type { FC, SyntheticEvent } from 'react'
import { Button, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { DEFAULT_IMAGE, type MotorModeCardData } from '../modules/motorModes'
import { LikeIcon } from './LikeIcon'

interface Props {
  motorMode: MotorModeCardData
  to: string
  onDelete?: (id: number) => void
  disabled?: boolean
}

export const MotorModeCard: FC<Props> = ({ motorMode, to, onDelete, disabled = false }) => {
  const { id, mode_name, image_url, consumption_wh_per_km, like_count } = motorMode

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!event.currentTarget.src.endsWith(DEFAULT_IMAGE)) event.currentTarget.src = DEFAULT_IMAGE
  }

  return (
    <Card className="mode-card">
      <Card.Img
        variant="top"
        className="mode-card__image"
        src={image_url || DEFAULT_IMAGE}
        alt={`Режим ${mode_name}`}
        onError={handleImageError}
      />
      <Card.Body className="mode-card__body">
        <Card.Title className="mode-card__title">
          <Link className="stretched-link text-reset text-decoration-none" to={to} aria-label={`Подробнее о режиме ${mode_name}`}>
            {mode_name}
          </Link>
        </Card.Title>
        <Card.Text className="mode-card__consumption">
          {consumption_wh_per_km !== null && `${consumption_wh_per_km} Вт·ч/км`}
        </Card.Text>
        <span className="like like--card" role="img" aria-label={`Лайков: ${like_count}`}>
          <LikeIcon />
          <span className="like__count">{like_count}</span>
        </span>
        {onDelete && (
          <Button className="button button--secondary button--wide mode-card__delete" disabled={disabled} onClick={() => onDelete(id)}>
            Удалить
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}
