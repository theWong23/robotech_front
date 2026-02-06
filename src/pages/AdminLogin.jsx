import { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/axiosConfig";
import AuthContext from "../context/AuthContext";

export default function AdminLogin() {

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const { login, token, roles } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const roleList = Array.isArray(roles) ? roles : [];
    if (roleList.includes("ADMINISTRADOR") || roleList.includes("ROLE_ADMINISTRADOR")) {
      navigate("/admin", { replace: true });
      return;
    }
    if (roleList.includes("SUBADMINISTRADOR") || roleList.includes("ROLE_SUBADMINISTRADOR")) {
      navigate("/subadmin", { replace: true });
    }
  }, [token, roles, navigate]);

  // ... (ingresar function remains the same) ...
  const ingresar = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Validando credenciales...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await api.post("/admin/login", { correo, contrasena });

      Swal.close();

      // Normalizar rol (el backend devuelve "roles" como array)
      const roles = Array.isArray(res.data.roles)
        ? res.data.roles
        : (res.data.rol ? [res.data.rol] : []);
      const rol =
        roles.includes("ADMINISTRADOR") ? "ADMINISTRADOR" :
        roles.includes("SUBADMINISTRADOR") ? "SUBADMINISTRADOR" :
        "";

      // Centralizar manejo de sesiÃ³n en el AuthProvider
      login(res.data);

      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `${res.data.usuario.correo} (${rol || "SIN_ROL"})`
      });

      // Redirección CORRECTA según rol real de la BD
      switch (rol) {
        case "ADMINISTRADOR":
          window.location.href = "/admin";
          break;

        case "SUBADMINISTRADOR":
          window.location.href = "/subadmin";
          break;

        default:
          Swal.fire("Error", "Rol no autorizado", "error");
          break;
      }

    } catch (err) {
      Swal.close();
      const data = err?.response?.data;
      const msg =
        typeof data === "string"
          ? data
          : data?.mensaje || data?.message || "Credenciales incorrectas o acceso no autorizado";
      Swal.fire("Error", msg, "error");
    }
  };

  return (
    <>
      <div
        className="container-fluid d-flex align-items-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, rgba(220,53,69,0.12), rgba(220,53,69,0.04))",
        }}
      >
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-6">
              <div
                className="p-4 p-lg-5 h-100"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(220,53,69,0.95), rgba(120,10,18,0.95)), url('/img/coliseos.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "#fff",
                  borderRadius: "20px",
                }}
              >
                <div className="d-flex align-items-center gap-3 mb-4">
                  <img
                    src="/img/logo.jpg"
                    alt="Logo Robotech"
                    className="rounded shadow"
                    style={{ width: "72px", height: "72px", objectFit: "cover" }}
                  />
                  <div>
                    <h2 className="fw-bold mb-1">Panel Administrativo</h2>
                    <p className="mb-0 opacity-75">Acceso exclusivo para administradores</p>
                  </div>
                </div>

                <p className="lead mb-4">
                  Controla usuarios, clubes, jueces y torneos con herramientas avanzadas.
                  Mantén la liga organizada y segura desde un solo panel.
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <span className="badge text-bg-light text-dark px-3 py-2">Usuarios</span>
                  <span className="badge text-bg-light text-dark px-3 py-2">Torneos</span>
                  <span className="badge text-bg-light text-dark px-3 py-2">Jueces</span>
                  <span className="badge text-bg-light text-dark px-3 py-2">Coliseos</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div
                className="card p-4 p-lg-5 h-100"
                style={{
                  borderRadius: "20px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
                }}
              >
                <div className="mb-4">
                  <h3 className="fw-bold mb-1 text-danger">Acceso Administrativo</h3>
                  <p className="text-muted mb-0">
                    Ingresa con tu cuenta para continuar.
                  </p>
                </div>

                <form onSubmit={ingresar}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Correo</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="admin@robotech.com"
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

                  <button className="btn btn-danger btn-lg w-100 mb-3" type="submit">
                    Ingresar
                  </button>

                  <div className="d-flex justify-content-between align-items-center">
                    <Link to="/request-password-reset" className="small text-muted">
                      ¿Olvidaste tu contraseña?
                    </Link>
                    <Link to="/login" className="small fw-bold text-danger">
                      Acceso público
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
