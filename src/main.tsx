import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import './styles/index.css'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { StaticStory } from './components/StaticStory'
import { installTestProbe } from './lib/testHooks'

installTestProbe()

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary fallback={<StaticStory />}>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
