import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'
import { store } from './store'
import { PAGES_MOCK } from './modules/pages'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

if (PAGES_MOCK && import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`, { updateViaCache: 'none' })
    .catch((error) => console.error('Не удалось установить офлайн-режим.', error))
}
