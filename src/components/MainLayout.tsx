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

export const MainLayout: React.FC = () => {

    const [jwt, setJwt] = useState<string | null>(localStorage.getItem("token"));
    const [jwtDecoded, setDecoded] = useState<JWTDecoded | null>(jwt ? jwtDecode<JWTDecoded>(jwt) : null);

    const [employee, setEmployee] = useState<Employee>();

    const auth = useAuth();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const menu = useRef<Menu>(null);


    const items = [
        { label: "Inicio", icon: "pi pi-home", command: () => navigate("/home/dashboard") },
        { label: 'Informes', icon: 'pi pi-chart-line', command: () => navigate('/home/reports') },
        { label: 'Subcontratas', icon: 'pi pi-briefcase', command: () => navigate('/home/companies') },
        { label: 'Documentos', icon: 'pi pi-file-check', command: () => navigate('/home/docs') },
    ];

    const profileMenu = [
        { label: 'Perfil', icon: 'pi pi-user', command: () => navigate('/home/profile') },
        { separator: true },
        {
            label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => {
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
        setJwt(localStorage.getItem("token") ?? null);
        setDecoded(jwt ? jwtDecode<JWTDecoded>(jwt) : null);
        if (jwtDecoded) {
            getEmployeeById(jwtDecoded.employee_id)
                .then(data => setEmployee(data))
                .catch((err: ErrorMessage) => {
                    toast.current?.show({
                        severity: "error",
                        summary: "Error al obtener el empleado en sesión",
                        detail: err.detail,
                        life: 3000
                    });
                });
        } else {
            navigate("/auth");
        }

    }, [jwt]);

    const start = (
      <div className="flex-1 min-w-0">
        <Menubar
          model={items}
          breakpoint="960px"
          className="w-full"
        />
      </div>
    );

    const center = (
      <div
        className="
          flex-0
          w-64
          text-center
          truncate
          overflow-hidden
          whitespace-nowrap
          px-4
          font-semibold
        "
        title={employee?.company.name}
      >
        {employee?.company.name}
      </div>
    );

    return (
        <div className="flex flex-col h-screen">
          <Toast ref={toast}/>
          <Menubar 
          model={items}
          end={end}
          start={<div/>}
          breakpoint/>
            <div className="flex items-center shadow-md">
                {start}{center}{end}
            </div>

            <main className="flex-1 overflow-auto p-4 bg-gray-50">
                <HomeRoutes />
            </main>
        </div>
    );
}