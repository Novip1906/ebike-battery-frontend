export const ROUTES = {
  FEED: '/motor_modes/feed',
  DRAFT: '/motor_modes/draft',
  GRID: '/motor_modes',
  LOGIN: '/riders/login',
}

export type RouteKeyType = keyof typeof ROUTES

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  FEED: 'Лента',
  DRAFT: 'Добавление',
  GRID: 'Плитка',
  LOGIN: 'Вход',
}
