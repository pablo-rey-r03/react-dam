import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {Toast} from "primereact/toast"
import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import {Button} from "primereact/button";
import {FloatLabel} from "primereact/floatlabel";

export const LoginForm: React.FC = () => {
  const {login} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = React.useRef<Toast>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({email, password});
      toast.current?.show({
        severity: "success",
        summary: "¡Éxito!",
        detail: "Se ha iniciado sesión correctamente.",
        life: 3000
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error en el inicio de sesión",
        detail: "Las credenciales no son correctas",
        life: 3000
      })
    }
  };

  return (
    <div className="login-container">
      <Toast ref={toast} />
      <form onSubmit={onSubmit} className="login-form">
        <h2>Iniciar sesión</h2>
        <FloatLabel>
          <InputText id="email" value={email} onChange={e => setEmail(e.target.value)} required/>
          <label htmlFor="email">Correo electrónico</label>
        </FloatLabel>
        <FloatLabel>
          <Password id="password" value={password} onChange={e => setPassword(e.target.value)} toggleMask feedback={false} required/>
          <label htmlFor="password">Contraseña</label>
        </FloatLabel>
        <Button type="submit" label="Iniciar sesión" className="p-mt-2" icon="pi pi-sign-in"/>
      </form>
    </div>
  );
}