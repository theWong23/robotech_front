import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function RoleRoute({ children, allowed }) {
    const { roles } = useContext(AuthContext);
    const allowedSet = Array.isArray(allowed) ? allowed : [];
    const rolesSet = Array.isArray(roles) ? roles : [];
    return allowedSet.some(r => rolesSet.includes(r)) ? children : <Navigate to="/" />;
}
