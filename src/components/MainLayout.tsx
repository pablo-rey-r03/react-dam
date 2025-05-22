import { jwtDecode } from "jwt-decode";
import type React from "react";
import { useNavigate } from "react-router-dom";
import type JWTDecoded from "../model/JWTDecoded";
import type Employee from "../model/Employee";
import { useEffect, useRef, useState } from "react";
import { getEmployeeById } from "../service/EmployeeService";
import type ErrorMessage from "../model/msg/ErrorMessage";
import { Toast } from "primereact/toast";
import { useAuth } from "../context/AuthContext";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { HomeRoutes } from "../routing/HomeRoutes";
import { Image } from "primereact/image";

export const MainLayout: React.FC = () => {

    const jwt: JWTDecoded = jwtDecode(localStorage.getItem("token")!);

    const [employee, setEmployee] = useState<Employee>();

    const auth = useAuth();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const menu = useRef<Menu>(null);


    const items = [
        { label: "Inicio", icon: "pi pi-home", command: () => navigate("/home/dashboard") },
        { label: 'Subcontratas', icon: 'pi pi-fw pi-briefcase', command: () => navigate('/home/companies') },
        { label: 'Proyectos', icon: 'pi pi-fw pi-briefcase', command: () => navigate('/home/projects') },
        { label: 'Informes', icon: 'pi pi-fw pi-chart-line', command: () => navigate('/home/reports') },
    ];

    const profileMenu = [
        { label: 'Perfil', icon: 'pi pi-fw pi-user', command: () => navigate('/home/profile') },
        { separator: true },
        {
            label: 'Cerrar sesión', icon: 'pi pi-fw pi-sign-out', command: () => {
                auth.logout();
                navigate('/auth', { replace: true });
            }
        }
    ];

    const end = (
        <div className="flex items-center space-x-2">
            <Button
                label={employee?.name}
                icon="pi pi-address-book"
                onClick={(e) => menu.current?.toggle(e)}
                className="p-button-text text-gray-700"
            />
            <Menu model={profileMenu} popup ref={menu} />
        </div>
    );

    useEffect(() => {
        getEmployeeById(jwt.employee_id)
            .then(data => setEmployee(data))
            .catch((err: ErrorMessage) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Error al obtener el empleado en sesión",
                    detail: err.detail,
                    life: 3000
                });
            });
    }, []);

    return (
        <div className="flex flex-col h-screen relative">
            <div className="relative">
                <Menubar model={items} start={<div></div>} end={end} className="shadow-md m-3" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <Image src="/Numby-removebg-preview.png"
                        alt="logo"
                        width="125"
                        imageStyle={{ objectFit: "contain" }} />
                </div>

            </div>

            <main className="flex-1 overflow-auto p-4 bg-gray-50">
                <HomeRoutes />
            </main>
        </div>
    );
}