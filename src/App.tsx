import './App.css'
import { useAuth } from './context/AuthContext'
import { LoginForm } from './components/LoginForm'

function App() {
  const {token} = useAuth();

  return token ? <div>Hola</div> : <LoginForm />
}

export default App
