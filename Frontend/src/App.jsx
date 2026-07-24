import './App.css'
import AppRoutes from './routes/router'
import { BrowserRouter } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import InitialLoader from './component/InitialLoader'

function App() {

  return (
    <>
      <InitialLoader />
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </>
  )
}

export default App
