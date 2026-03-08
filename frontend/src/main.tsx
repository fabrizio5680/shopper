import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './firebase' // initialize Firebase before anything else
import App from './App.tsx'

async function main() {
  const root = createRoot(document.getElementById('root')!)

  if (import.meta.env.DEV) {
    const { DevTools } = await import('jotai-devtools')
    await import('jotai-devtools/styles.css')
    root.render(
      <StrictMode>
        <DevTools />
        <App />
      </StrictMode>,
    )
  } else {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }
}

main()
