import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './components/AppRouter'
import App from './App'
import { Analytics } from '@vercel/analytics/next';

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <App/>
    <Analytics/>
  </StrictMode>,
)
import './index.css'
