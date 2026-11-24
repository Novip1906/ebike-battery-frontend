import { useState, type FC, type ReactNode } from 'react'
import { Nav } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PAGES_MOCK } from '../modules/pages'
import { logoutRider } from '../modules/riderAuth'
import { LOGOUT_LABEL, ROUTES, ROUTE_LABELS, type RouteKeyType } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { resetRider } from '../store/riderSlice'
import { LoadingOverlay } from './LoadingOverlay'

interface Tab {
  key: RouteKeyType
  icon: ReactNode
  riderOnly?: boolean
}

const TABS: Tab[] = [
  {
    key: 'FEED',
    icon: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M10 9l5 3-5 3z" className="tab-bar__icon-inner" />
      </>
    ),
  },
  { key: 'DRAFT', icon: <path d="M11 5h2v14h-2zM5 11h14v2H5z" />, riderOnly: true },
  { key: 'GRID', icon: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /> },
  {
    key: 'LOGIN',
    icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />,
  },
]

const LOGOUT_ICON = <path d="M5 4h8v2H7v12h6v2H5zM15.6 7.4 17 6l6 6-6 6-1.4-1.4 3.6-3.6H10v-2h9.2z" />

export const TabBar: FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.rider.isAuthenticated)
  const [loggingOut, setLoggingOut] = useState(false)

  const isActive = (key: RouteKeyType) =>
    key === 'GRID' ? pathname === ROUTES.GRID : pathname.startsWith(ROUTES[key])

  const handleLogout = async () => {
    setLoggingOut(true)
    await logoutRider().catch(() => null)
    setLoggingOut(false)
    dispatch(resetRider())
    navigate(ROUTES.GRID)
  }

  return (
    <>
      <Nav as="nav" className="tab-bar">
        {TABS.map(({ key, icon, riderOnly }) => {
          const logout = key === 'LOGIN' && isAuthenticated && !PAGES_MOCK
          const content = (
            <>
              <svg className="tab-bar__icon" viewBox="0 0 24 24" aria-hidden="true">
                {logout ? LOGOUT_ICON : icon}
              </svg>
              {logout ? LOGOUT_LABEL : ROUTE_LABELS[key]}
            </>
          )
          if (logout) {
            return (
              <Nav.Link key={key} as="button" type="button" className="tab-bar__link" onClick={handleLogout}>
                {content}
              </Nav.Link>
            )
          }
          if ((riderOnly && (!isAuthenticated || PAGES_MOCK)) || (key === 'LOGIN' && PAGES_MOCK)) {
            return (
              <span key={key} className="nav-link tab-bar__link disabled" aria-disabled="true">
                {content}
              </span>
            )
          }
          return (
            <Nav.Link
              key={key}
              as={Link}
              to={ROUTES[key]}
              aria-current={isActive(key) ? 'page' : undefined}
              className={`tab-bar__link${isActive(key) ? ' tab-bar__link--active' : ''}`}
            >
              {content}
            </Nav.Link>
          )
        })}
      </Nav>
      <LoadingOverlay show={loggingOut} />
    </>
  )
}
