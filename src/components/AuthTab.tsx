import type React from "react";
import { TabPanel, TabView } from "primereact/tabview"
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export const AuthTab: React.FC = () => (
    <div className="auth-tab">
        <TabView>
            <TabPanel header="Iniciar sesión">
                <LoginForm />
            </TabPanel>
            <TabPanel header="Registrarse">
                <RegisterForm />
            </TabPanel>
        </TabView>
    </div>
)