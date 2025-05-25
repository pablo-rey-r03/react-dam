import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Toast } from "primereact/toast"
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { useNavigate } from "react-router-dom";

export const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const toast = React.useRef<Toast>(null);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login({ email, password })
            .then(() => navigate("/home"))
            .catch(() => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error en el inicio de sesión",
                    detail: "Las credenciales son incorrectas",
                    life: 3000
                });
            });
    };

    return (
        <div className="flex flex-1 h-full items-center justify-center overflow-hidden">
            <Toast ref={toast} />
            <form onSubmit={onSubmit} className="w-full max-w-md px-4 py-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">Iniciar sesión</h2>
                <FloatLabel className="mb-5 w-69 mx-auto">
                    <InputText type="email" className="w-full" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <label htmlFor="email">Correo electrónico</label>
                </FloatLabel>
                <FloatLabel className="mb-5 w-69 mx-auto">
                    <Password className="w-full" id="password" value={password} onChange={e => setPassword(e.target.value)} toggleMask feedback={false} required style={{ width: '100%' }} />
                    <label htmlFor="password">Contraseña</label>
                </FloatLabel>
                <Button type="submit" label="Iniciar sesión" className="w-100 mt-4" icon="pi pi-sign-in" />
            </form>
        </div>
    );
}