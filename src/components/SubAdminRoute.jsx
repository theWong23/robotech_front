import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function SubAdminRoute({ children }) {
  const { token, roles } = useContext(AuthContext) || {};

  if (!token) return <Navigate to="/admin/login" replace />;

  const roleList = Array.isArray(roles) ? roles : [];
  const isSubAdmin =
    roleList.includes("SUBADMINISTRADOR") ||
    roleList.includes("ROLE_SUBADMINISTRADOR");

  return isSubAdmin ? children : <Navigate to="/admin/login" replace />;
}
