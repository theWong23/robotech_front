import axios from "axios";
import { API_BASE_URL } from "./config";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const normalizeErrorMessage = (error) => {
  const data = error?.response?.data;
  const fieldErrors = data && typeof data === "object" ? data.fieldErrors : null;
  const firstFieldError =
    fieldErrors && typeof fieldErrors === "object"
      ? Object.values(fieldErrors).find(Boolean)
      : null;

  const message =
    typeof data === "string"
      ? data
      : data?.message ||
        data?.mensaje ||
        firstFieldError ||
        data?.error ||
        error?.message ||
        "Ocurrio un error inesperado";

  if (error?.response) {
    if (!data || typeof data !== "object") {
      error.response.data = {};
    }
    error.response.data.message = message;
  }

  error.userMessage = message;
  return message;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = normalizeErrorMessage(error);
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
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
