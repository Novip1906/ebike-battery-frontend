import type { FC, ReactNode } from 'react'
import { Nav } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS, type RouteKeyType } from '../Routes'

interface Tab {
  key: RouteKeyType
  icon: ReactNode
  disabled?: boolean
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
  { key: 'DRAFT', icon: <path d="M11 5h2v14h-2zM5 11h14v2H5z" />, disabled: true },
  { key: 'GRID', icon: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /> },
  {
    key: 'LOGIN',
    icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />,
    disabled: true,
  },
]

export const TabBar: FC = () => {
  const { pathname } = useLocation()

  const isActive = (key: RouteKeyType) =>
    key === 'GRID' ? pathname === ROUTES.GRID : pathname.startsWith(ROUTES[key])

  return (
    <Nav as="nav" className="tab-bar">
      {TABS.map(({ key, icon, disabled }) => (
        <Nav.Link
          key={key}
          as={Link}
          to={ROUTES[key]}
          disabled={disabled}
          className={`tab-bar__link${isActive(key) ? ' tab-bar__link--active' : ''}`}
        >
          <svg className="tab-bar__icon" viewBox="0 0 24 24" aria-hidden="true">
            {icon}
          </svg>
          {ROUTE_LABELS[key]}
        </Nav.Link>
      ))}
    </Nav>
  )
}
