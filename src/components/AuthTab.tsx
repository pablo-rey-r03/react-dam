import type React from "react";
import { TabPanel, TabView } from "primereact/tabview"
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Image } from "primereact/image";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const AuthTab: React.FC = () => {

    const { logout } = useAuth();

    useEffect(() => {
        logout()
    }, []);

    return (
        <div className="auth-tab flex flex-col items-center p-4 justify-center h-screen">
            <div className="auth-header text-center mb-6">
                <h1 className="text-3xl font-bold mb-2">MetaConti</h1>
                <Image src="/MischNumby-removebg-preview.png" alt="logo" width="300" preview={false} />
            </div>
            <TabView className="custom-tabview w-full">
                <TabPanel header="Iniciar sesión">
                    <LoginForm />
                </TabPanel>
                <TabPanel header="Registrarse">
                    <RegisterForm />
                </TabPanel>
            </TabView>
        </div>
    )
}