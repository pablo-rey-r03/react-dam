import { AuthProvider } from './context/AuthContext'
import { AuthTab } from './components/AuthTab';

function App() {
    return (
        <AuthProvider>
            <AuthTab />
        </AuthProvider>
    )
}

export default App
