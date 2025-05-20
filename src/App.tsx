import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthTab } from './components/AuthTab';
import { PrivateRoute } from './security/PrivateRoute';
import { Home } from './components/Home';
import { ErrorPage } from './security/ErrorPage';

function App() {
    const jwt: string | null = localStorage.getItem("token");
    return (
        <Routes>
            <Route path='/'
                element={
                    jwt ? <Navigate to={"/home"} replace /> : <Navigate to={"/auth"} replace />
                }
            />

            <Route path='/auth' element={<AuthTab />} />

            <Route path='/home' element={
                <PrivateRoute>
                    <Home />
                </PrivateRoute>
            } />

            <Route path='*' element={<ErrorPage />} />
        </Routes>
    )
}

export default App
