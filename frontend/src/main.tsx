import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import App from './App.tsx'
import SignupPage from './Pages/Auth/signup/SignupPage.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SignupPage />
  </StrictMode>,
)
