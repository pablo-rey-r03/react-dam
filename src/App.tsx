import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthTab } from './components/AuthTab';
import { PrivateRoute } from './security/PrivateRoute';
import { ErrorPage } from './security/ErrorPage';
import { MainLayout } from './components/MainLayout';

function App() {
    const jwt: string | null = localStorage.getItem("token");
    return (
        <Routes>
            <Route path='/'
                element={
                    jwt ? <Navigate to={"/home/dashboard"} replace /> : <Navigate to={"/auth"} replace />
                }
            />

            <Route path='/auth' element={<AuthTab />} />

            <Route path='/home/*' element={
                <PrivateRoute>
                    <MainLayout />
                </PrivateRoute>
            } />

            <Route path='*' element={<ErrorPage />} />
        </Routes>
    )
}

export default App
