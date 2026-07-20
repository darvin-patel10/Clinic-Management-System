import './App.css'
import AppRoutes from './routes/router'
import { BrowserRouter } from 'react-router'

function App() {

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
