import { type ChangeEvent, type FC, type FormEvent, type SyntheticEvent, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { DEFAULT_IMAGE, DEFAULT_VIDEO, type MotorModeDetail } from '../modules/motorModes'
import { ROUTES } from '../Routes'
import { useAppDispatch } from '../store/hooks'
import { createMotorModeDraft, deleteMotorModeDraft, publishMotorModeDraft } from '../store/motorModeDraftSlice'

interface Props {
  draft: MotorModeDetail | null
  loading: boolean
}

const fileOf = (event: ChangeEvent<HTMLInputElement>) => event.target.files?.[0] ?? null

const fallbackTo = (url: string) => (event: SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
  if (!event.currentTarget.src.endsWith(url)) event.currentTarget.src = url
}

export const MotorModeDraftForm: FC<Props> = ({ draft, loading }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [modeName, setModeName] = useState(draft?.mode_name ?? '')
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [shortDescription, setShortDescription] = useState('')
  const [supportPercent, setSupportPercent] = useState('')
  const [consumptionWhPerKm, setConsumptionWhPerKm] = useState('')
  const imagePreview = useObjectUrl(image)
  const videoPreview = useObjectUrl(video)

  const handleCreate = (event: FormEvent) => {
    event.preventDefault()
    if (image && video) dispatch(createMotorModeDraft({ mode_name: modeName.trim(), image, video }))
  }

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft) return
    const result = await dispatch(
      publishMotorModeDraft({
        motorModeId: draft.id,
        mode_name: modeName.trim(),
        short_description: shortDescription.trim(),
        support_percent: Number(supportPercent),
        consumption_wh_per_km: Number(consumptionWhPerKm),
      }),
    )
    if (publishMotorModeDraft.fulfilled.match(result)) navigate(`${ROUTES.FEED}/${result.payload.id}`)
  }

  const handleDelete = () => {
    if (draft) dispatch(deleteMotorModeDraft(draft.id))
  }

  const imageUrl = (draft ? draft.image_url : imagePreview) || DEFAULT_IMAGE
  const videoUrl = (draft ? draft.video_url : videoPreview) || DEFAULT_VIDEO

  return (
    <Form onSubmit={draft ? handlePublish : handleCreate}>
      <section className="draft__section">
        <h2 className="draft__section-title">Медиа режима</h2>

        {!draft && (
          <Form.Group className="field" controlId="motorModeImage">
            <Form.Label className="field__label">Фото режима</Form.Label>
            <Form.Control
              className="field__input field__input--file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(event: ChangeEvent<HTMLInputElement>) => setImage(fileOf(event))}
            />
          </Form.Group>
        )}
        <img className="draft__preview" src={imageUrl} alt="Фото режима" onError={fallbackTo(DEFAULT_IMAGE)} />

        {!draft && (
          <Form.Group className="field" controlId="motorModeVideo">
            <Form.Label className="field__label">Видео режима</Form.Label>
            <Form.Control
              className="field__input field__input--file"
              type="file"
              accept="video/mp4"
              required
              onChange={(event: ChangeEvent<HTMLInputElement>) => setVideo(fileOf(event))}
            />
          </Form.Group>
        )}
        <video
          key={videoUrl}
          className="draft__preview"
          src={videoUrl}
          poster={imageUrl}
          aria-label="Видео режима"
          muted
          loop
          playsInline
          controls
          onError={fallbackTo(DEFAULT_VIDEO)}
        />
      </section>

      <section className="draft__section">
        <h2 className="draft__section-title">Текстовое описание</h2>

        <Form.Group className="field" controlId="motorModeName">
          <Form.Label className="field__label">Название режима</Form.Label>
          <Form.Control
            className="field__input"
            type="text"
            maxLength={50}
            required
            value={modeName}
            onChange={(event) => setModeName(event.target.value)}
          />
        </Form.Group>

        {draft && (
          <Form.Group className="field" controlId="motorModeShortDescription">
            <Form.Label className="field__label">Краткое описание</Form.Label>
            <Form.Control
              className="field__input field__input--textarea"
              as="textarea"
              rows={5}
              maxLength={600}
              required
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
            />
          </Form.Group>
        )}
      </section>

      {draft && (
        <section className="draft__section">
          <h2 className="draft__section-title">Параметры режима</h2>

          <Form.Group className="field" controlId="motorModeSupportPercent">
            <Form.Label className="field__label">Поддержка мотора, %</Form.Label>
            <Form.Control
              className="field__input"
              type="number"
              min={0}
              max={1000}
              step={1}
              required
              value={supportPercent}
              onChange={(event) => setSupportPercent(event.target.value)}
            />
          </Form.Group>

          <Form.Group className="field" controlId="motorModeConsumption">
            <Form.Label className="field__label">Расход батареи, Вт·ч/км</Form.Label>
            <Form.Control
              className="field__input"
              type="number"
              min={0.1}
              max={999.9}
              step={0.1}
              required
              value={consumptionWhPerKm}
              onChange={(event) => setConsumptionWhPerKm(event.target.value)}
            />
          </Form.Group>
        </section>
      )}

      <Button className="button button--primary button--wide" type="submit" disabled={loading}>
        {draft ? 'Опубликовать' : 'Далее'}
      </Button>
      {draft && (
        <Button className="button button--secondary button--wide draft__delete" disabled={loading} onClick={handleDelete}>
          Удалить черновик
        </Button>
      )}
    </Form>
  )
}
