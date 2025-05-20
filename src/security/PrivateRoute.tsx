import type React from "react";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: JSX.Element;
}

export const PrivateRoute: React.FC<Props> = ({ children }) => {
    const jwt = localStorage.getItem("token");

    if (!jwt) {
        return <Navigate to={"/auth"} replace />
    }

    return children;
}