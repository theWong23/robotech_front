import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { token, roles } = useContext(AuthContext) || {};

  if (!token) return <Navigate to="/admin/login" replace />;

  const roleList = Array.isArray(roles) ? roles : [];
  const isAdmin =
    roleList.includes("ADMINISTRADOR") || roleList.includes("ROLE_ADMINISTRADOR");

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}
