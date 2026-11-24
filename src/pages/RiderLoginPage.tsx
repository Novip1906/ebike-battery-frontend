import { type FC, type FormEvent, useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Navigate, useLocation } from 'react-router-dom'
import { errorMessage } from '../modules/errors'
import { loginRider } from '../modules/riderAuth'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setAuthPending, setRider } from '../store/riderSlice'

const RiderLoginPage: FC = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { isAuthenticated, authPending } = useAppSelector((state) => state.rider)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to={(location.state as { from?: string } | null)?.from ?? ROUTES.GRID} replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    dispatch(setAuthPending(true))
    setError(null)
    try {
      const rider = await loginRider(login.trim(), password)
      dispatch(setRider(rider))
    } catch (authError) {
      setError(errorMessage(authError, 'Не удалось войти: веб-сервис недоступен.'))
      dispatch(setAuthPending(false))
    }
  }

  return (
    <main className="rider-login">
      <header className="rider-login__header">
        <h1 className="rider-login__title">Вход велосипедиста</h1>
      </header>

      {error && <Alert className="screen-error">{error}</Alert>}

      <Form className="rider-login__form" onSubmit={handleSubmit}>
        <Form.Group className="field" controlId="riderLogin">
          <Form.Label className="field__label">Логин</Form.Label>
          <Form.Control
            className="field__input"
            type="text"
            autoComplete="username"
            required
            value={login}
            onChange={(event) => setLogin(event.target.value)}
          />
        </Form.Group>

        <Form.Group className="field" controlId="riderPassword">
          <Form.Label className="field__label">Пароль</Form.Label>
          <Form.Control
            className="field__input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Form.Group>

        <Button className="button button--primary button--wide" type="submit" disabled={authPending}>
          Войти
        </Button>
      </Form>
    </main>
  )
}

export default RiderLoginPage
