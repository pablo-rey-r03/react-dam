import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

import 'primeflex/primeflex.css';
import 'primereact/resources/themes/lara-dark-purple/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { addLocale, PrimeReactProvider } from 'primereact/api';
import { BrowserRouter } from 'react-router-dom';

addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ],
    monthNamesShort: [
        'ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ],
    today: 'Hoy',
    clear: 'Limpiar',
    // **Estos son los que te faltan**
    chooseYear: 'Seleccionar año',
    chooseMonth: 'Seleccionar mes',
    chooseDate: 'Seleccionar fecha'
});


createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <AuthProvider>
            <StrictMode>
                <PrimeReactProvider>
                    <App />
                </PrimeReactProvider>
            </StrictMode>
        </AuthProvider>
    </BrowserRouter>
)
