import type React from "react";
import { TabPanel, TabView } from "primereact/tabview"
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Image } from "primereact/image";

export const AuthTab: React.FC = () => (
    <div className="auth-tab flex flex-col items-center p-4">
        <div className="auth-header text-center mb-6">
            <h1 className="text-3x1 font-bold mb-2">MetaConti</h1>
            <Image src="src\assets\MischNumby-removebg-preview.png" alt="logo" width="120" preview={false} />
        </div>
        <TabView className="custom-tabview w-full max-x-md">
            <TabPanel header="Iniciar sesión">
                <LoginForm />
            </TabPanel>
            <TabPanel header="Registrarse">
                <RegisterForm />
            </TabPanel>
        </TabView>
    </div>
)