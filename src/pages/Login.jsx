import { useState, useContext } from "react";
// 1. Agregamos 'Link' a la importacion
import { useNavigate, Link } from "react-router-dom"; 
import axios from "axios";
import Swal from "sweetalert2";
import AuthContext from "../context/AuthContext";

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
        "http://localhost:8080/api/auth/login",
        { correo, contrasena }
      );

      Swal.close();

      const { token, roles, entidad } = data;
      const rolesList = Array.isArray(roles) ? roles : [];

      // ? Bloquear administradores
      if (rolesList.includes("ADMINISTRADOR") || rolesList.includes("SUBADMINISTRADOR")) {
        await Swal.fire({
          icon: "warning",
          title: "Acceso no permitido",
          text: "Este login es solo para Club, Competidor y Juez",
        });
        return;
      }

      // ? Guardar sesion
      login({
        token,
        roles: rolesList,
        entidad,
      });

      await Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `Roles detectados: ${rolesList.join(", ")}`,
      });

      const ruta = rolesList.includes("CLUB")
        ? "/club"
        : rolesList.includes("COMPETIDOR")
        ? "/competidor"
        : rolesList.includes("JUEZ")
        ? "/juez"
        : "/";

      navigate(ruta);

    } catch (error) {
      Swal.close();
      const data = error?.response?.data;
      const mensaje = typeof data === "string"
          ? data
          : data?.message || data?.mensaje || "Correo o contrasena incorrectos";

      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesion",
        text: mensaje,
      });
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#00b3b3" }}>
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/img/logo.jpg" alt="Logo" height="50" />
          </Link>
        </div>
      </nav>

      {/* LOGIN */}
      <div className="container my-5">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-4 d-flex justify-content-center">
            <img
              src="/img/logo.jpg"
              alt="Logo Robotech"
              className="img-fluid"
              style={{ maxWidth: "260px" }}
            />
          </div>

          <div className="col-md-5">
            <h3 className="fw-bold text-primary mb-4">
              Iniciar sesion
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contrasena"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
              >
                Ingresar
              </button>

              <div className="text-center">
                <a href="#" className="small text-muted d-block mb-2">
                  ?Olvidaste tu contrasena?
                </a>
                <p className="small mb-0">
                  ?No tienes cuenta?{" "}
                  {/* 2. Aqui cambiamos el <a> por <Link> */}
                  <Link to="/register" className="text-primary fw-bold">
                    Registrate
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
