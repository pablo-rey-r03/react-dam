import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

export const ErrorPage: React.FC = () => {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/home');
    };

    return (
        <div style={styles.container}>
            <Card title="404 - Página no encontrada">
                <p style={styles.message}>
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>
                <Button
                    label="Volver a Home"
                    icon="pi pi-home"
                    onClick={goHome}
                    className="p-button-rounded p-button-outlined"
                />
            </Card>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        alignItems: 'center' as const,
        justifyContent: 'center' as const
    },
    message: {
        marginBottom: '1.5rem',
        fontSize: '1.1rem',
        color: '#555'
    }
};
