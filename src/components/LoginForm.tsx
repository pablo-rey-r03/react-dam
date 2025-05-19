import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {Toast} from "primereact/toast"
import {InputText} from "primereact/inputtext";
import {Password} from "primereact/password";
import {Button} from "primereact/button";

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
        detail: "Se ha iniciado sesión correctamente."
      });
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error en el inicio de sesión",
        detail: "Las credenciales no son correctas"
      })
    }
  };

  return (
    <div className="login-container">
      <Toast ref={toast} />
      <form onSubmit={onSubmit} className="login-form">
        <h2>Iniciar sesión</h2>
        <div className="p-field">
          <label htmlFor="email">Correo electrónico</label>
          <InputText id="email" value={email} onChange={e => setEmail(e.target.value)} required/>
        </div>
        <div className="p-field">
          <label htmlFor="password">Contraseña</label>
          <Password id="password" value={password} onChange={e => setPassword(e.target.value)} toggleMask feedback={false} required/>
        </div>
        <Button type="submit" label="Iniciar sesión" className="p-mt-2"/>
      </form>
    </div>
  );
}