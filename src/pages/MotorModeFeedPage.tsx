import { type FC, type SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { LikeIcon } from '../components/LikeIcon'
import { DEFAULT_IMAGE, DEFAULT_VIDEO, motorModeFeedMock } from '../modules/motorModes'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getMotorModeFeed, likeMotorMode } from '../store/motorModeFeedSlice'

const MotorModeFeedPage: FC = () => {
  const { motorModeId } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.rider.isAuthenticated)
  const { motorMode: currentMotorMode, loading, error } = useAppSelector((state) => state.motorModeFeed)
  const motorMode =
    currentMotorMode && (!motorModeId || Number(motorModeId) === currentMotorMode.id) ? currentMotorMode : null
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const skipFetch = useRef(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    setDescriptionOpen(false)
    if (skipFetch.current) {
      skipFetch.current = false
      return
    }
    const request = dispatch(getMotorModeFeed({ motorModeId: motorModeId ? Number(motorModeId) : undefined }))
    return () => request.abort()
  }, [dispatch, motorModeId])

  if (!motorMode) {
    return <main className="feed">{error && <Alert className="screen-error feed__error">{error}</Alert>}</main>
  }

  const handleNext = async () => {
    const result = await dispatch(getMotorModeFeed({ motorModeId: motorMode.id, next: true }))
    const latestRequestId = dispatch((_, getState) => getState().motorModeFeed.requestId)
    if (!mounted.current || result.meta.requestId !== latestRequestId) return
    const next = getMotorModeFeed.fulfilled.match(result)
      ? result.payload
      : result.payload?.guest
        ? motorModeFeedMock(motorMode.id, true)
        : null
    if (next && next.id !== motorMode.id) {
      skipFetch.current = true
      navigate(`${ROUTES.FEED}/${next.id}`)
    }
  }

  const liked = motorMode.liked_by_current_rider === 1

  const handleLike = () => dispatch(likeMotorMode({ motorModeId: motorMode.id, like: liked ? 0 : 1 }))

  const handleVideoError = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (!event.currentTarget.src.endsWith(DEFAULT_VIDEO)) event.currentTarget.src = DEFAULT_VIDEO
  }

  return (
    <main className="feed">
      <video
        key={motorMode.id}
        className="feed__video"
        aria-label={`Видео режима ${motorMode.mode_name}`}
        crossOrigin="anonymous"
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

        {error && <Alert className="screen-error feed__error">{error}</Alert>}

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

            {isAuthenticated ? (
              <button
                type="button"
                className={`like like--feed like--button${liked ? ' like--liked' : ''}`}
                aria-pressed={liked}
                aria-label={`Лайк, лайков: ${motorMode.like_count}`}
                disabled={loading}
                onClick={handleLike}
              >
                <LikeIcon />
                <span className="like__count">{motorMode.like_count}</span>
              </button>
            ) : (
              <span className="like like--feed" role="img" aria-label={`Лайков: ${motorMode.like_count}`}>
                <LikeIcon />
                <span className="like__count">{motorMode.like_count}</span>
              </span>
            )}

            <Button
              className="button button--primary feed__next"
              onClick={handleNext}
              disabled={loading}
              aria-label="Следующий"
              title="Следующий"
            >
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
