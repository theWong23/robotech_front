import axios from "axios";
import { API_BASE_URL } from "./config";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      const data = error?.response?.data;
      const msg =
        typeof data === "string"
          ? data
          : data?.mensaje || data?.message || "Tu sesión no es válida";

      if (typeof window !== "undefined") {
        const path = window.location.pathname || "";
        const isAdmin = path.startsWith("/admin");
        const onLogin = path.startsWith("/login") || path.startsWith("/admin/login");

        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        localStorage.removeItem("roles");
        localStorage.removeItem("entidad");

        return Swal.fire("Acceso denegado", msg, "error").then(() => {
          if (!onLogin) {
            window.location.href = isAdmin ? "/admin/login" : "/login";
          }
          return Promise.reject(error);
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
