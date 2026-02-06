import { useState, useContext } from "react";
// 1. Agregamos 'Link' a la importación
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../services/config";
import Swal from "sweetalert2";
import AuthContext from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Validando...",
      text: "Por favor espera",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { correo, contrasena }
      );

      Swal.close();

      const { token, roles, entidad } = data;

      const rolesArray = Array.isArray(roles) ? roles : (data.rol ? [data.rol] : []);

      const rolSeleccionado =
        rolesArray.includes("CLUB") ? "CLUB" :
        rolesArray.includes("JUEZ") ? "JUEZ" :
        rolesArray.includes("COMPETIDOR") ? "COMPETIDOR" :
        rolesArray.includes("ADMINISTRADOR") ? "ADMINISTRADOR" :
        rolesArray.includes("SUBADMINISTRADOR") ? "SUBADMINISTRADOR" :
        "";

      // Bloquear administradores
      if (rolSeleccionado === "ADMINISTRADOR" || rolSeleccionado === "SUBADMINISTRADOR") {
        await Swal.fire({
          icon: "warning",
          title: "Acceso no permitido",
          text: "Este login es solo para Club, Competidor y Juez",
        });
        return;
      }

      // Guardar sesión
      login({
        token,
        roles: rolesArray,
        usuario: entidad,
        entidad,
      });

      await Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `Rol detectado correctamente: ${rolSeleccionado || "SIN_ROL"}`,
      });

      const rutasPorRol = {
        CLUB: "/club",
        COMPETIDOR: "/competidor",
        JUEZ: "/juez",
        CLUB_COMPETIDOR: "/club",
      };

      navigate(rutasPorRol[rolSeleccionado] || "/");

    } catch (error) {
      Swal.close();
      const mensaje = typeof error?.response?.data === "string"
          ? error.response.data
          : "Correo o contraseña incorrectos";

      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: mensaje,
      });
    }
  };

  const heroStyle = {
    minHeight: "calc(100vh - 72px)",
    background:
      "linear-gradient(135deg, rgba(0,179,179,0.12), rgba(0,179,179,0.04))",
  };

  const panelStyle = {
    backgroundImage: "linear-gradient(135deg, rgba(0,179,179,0.9), rgba(1,82,104,0.95)), url('/img/robots.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    borderRadius: "20px",
  };

  const cardStyle = {
    borderRadius: "20px",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
  };

  return (
    <>
      <Navbar />

      <div className="container-fluid py-5" style={heroStyle}>
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-6">
              <div className="p-4 p-lg-5 h-100" style={panelStyle}>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <img
                    src="/img/logo.jpg"
                    alt="Logo Robotech"
                    className="rounded shadow"
                    style={{ width: "72px", height: "72px", objectFit: "cover" }}
                  />
                  <div>
                    <h2 className="fw-bold mb-1">Robotech League</h2>
                    <p className="mb-0 opacity-75">Acceso para Club, Competidor y Juez</p>
                  </div>
                </div>

                <p className="lead mb-0">
                  Entra con tu cuenta para gestionar tu participación en la liga.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card p-4 p-lg-5 h-100" style={cardStyle}>
                <div className="mb-4">
                  <h3 className="fw-bold mb-1 text-primary">Iniciar sesión</h3>
                  <p className="text-muted mb-0">
                    Usa tu correo y contraseña para continuar.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Correo</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="tucorreo@ejemplo.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Contraseña</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="••••••••"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
                    Ingresar
                  </button>

                  <div className="d-flex justify-content-between align-items-center">
                    <Link to="/request-password-reset" className="small text-muted">
                      ¿Olvidaste tu contraseña?
                    </Link>
                    <Link to="/register" className="small fw-bold text-primary">
                      Crear cuenta
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
