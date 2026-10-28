import type { FC, SyntheticEvent } from 'react'
import { Card } from 'react-bootstrap'
import { DEFAULT_IMAGE, type MotorModeCardData } from '../modules/motorModes'
import { LikeIcon } from './LikeIcon'

interface Props {
  motorMode: MotorModeCardData
  onClick: (id: number) => void
}

export const MotorModeCard: FC<Props> = ({ motorMode, onClick }) => {
  const { id, mode_name, image_url, consumption_wh_per_km, like_count } = motorMode

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!event.currentTarget.src.endsWith(DEFAULT_IMAGE)) event.currentTarget.src = DEFAULT_IMAGE
  }

  return (
    <Card className="mode-card" onClick={() => onClick(id)}>
      <Card.Img
        variant="top"
        className="mode-card__image"
        src={image_url || DEFAULT_IMAGE}
        alt={`Режим ${mode_name}`}
        onError={handleImageError}
      />
      <Card.Body className="mode-card__body">
        <Card.Title className="mode-card__title">{mode_name}</Card.Title>
        <Card.Text className="mode-card__consumption">
          {consumption_wh_per_km !== null && `${consumption_wh_per_km} Вт·ч/км`}
        </Card.Text>
        <span className="like like--card" aria-label={`Лайков: ${like_count}`}>
          <LikeIcon />
          <span className="like__count">{like_count}</span>
        </span>
      </Card.Body>
    </Card>
  )
}
