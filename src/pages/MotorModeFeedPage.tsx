import { type FC, type SyntheticEvent, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { LikeIcon } from '../components/LikeIcon'
import { DEFAULT_IMAGE, DEFAULT_VIDEO, getMotorModeFeed, type MotorModeDetail } from '../modules/motorModes'
import { ROUTES } from '../Routes'

const MotorModeFeedPage: FC = () => {
  const { motorModeId } = useParams()
  const [motorMode, setMotorMode] = useState<MotorModeDetail | null>(null)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setDescriptionOpen(false)
    getMotorModeFeed(motorModeId ? Number(motorModeId) : undefined)
      .then(setMotorMode)
      .catch(() => setMotorMode(null))
  }, [motorModeId])

  if (!motorMode) return <main className="feed" />

  const handleNext = () =>
    getMotorModeFeed(motorMode.id, true).then((next) => navigate(`${ROUTES.FEED}/${next.id}`))

  const handleVideoError = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (!event.currentTarget.src.endsWith(DEFAULT_VIDEO)) event.currentTarget.src = DEFAULT_VIDEO
  }

  return (
    <main className="feed">
      <video
        key={motorMode.id}
        className="feed__video"
        src={motorMode.video_url || DEFAULT_VIDEO}
        poster={motorMode.image_url || DEFAULT_IMAGE}
        autoPlay
        muted
        loop
        playsInline
        onError={handleVideoError}
      />

      <div className="feed__overlay">
        <h1 className="feed__title">{motorMode.mode_name}</h1>

        <div className="feed__panel">
          <div className="feed__description">
            <p className={`feed__description-text${descriptionOpen ? ' feed__description-text--open' : ''}`}>
              {motorMode.short_description}
            </p>
            {descriptionOpen && (
              <p className="feed__description-range">
                Запас хода на аккумуляторе PowerTube 800 Вт·ч — около {motorMode.range_km} км.
              </p>
            )}
            <button type="button" className="feed__description-toggle" onClick={() => setDescriptionOpen(!descriptionOpen)}>
              {descriptionOpen ? 'Скрыть' : 'Ещё'}
            </button>
          </div>

          <div className="feed__side">
            <dl className="mode-params">
              <div className="mode-params__item">
                <dt className="mode-params__name">Поддержка мотора</dt>
                <dd className="mode-params__value">
                  {motorMode.support_percent !== null ? `${motorMode.support_percent} %` : '—'}
                </dd>
              </div>
              <div className="mode-params__item">
                <dt className="mode-params__name">Расход батареи</dt>
                <dd className="mode-params__value">
                  {motorMode.consumption_wh_per_km !== null ? `${motorMode.consumption_wh_per_km} Вт·ч/км` : '—'}
                </dd>
              </div>
            </dl>

            <span className="like like--feed" aria-label={`Лайков: ${motorMode.like_count}`}>
              <LikeIcon />
              <span className="like__count">{motorMode.like_count}</span>
            </span>

            <Button className="button button--primary feed__next" onClick={handleNext} aria-label="Следующий" title="Следующий">
              <svg className="feed__next-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 18l8.5-6L6 6zM16 6h2v12h-2z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MotorModeFeedPage
