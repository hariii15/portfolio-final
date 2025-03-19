import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './components/AppRouter'
import App from './App'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <App/>
  </StrictMode>,
)
import './index.css'
