import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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

      const { token, rol, entidad } = data;

      console.log("ROL:", rol);
      console.log("ENTIDAD:", entidad);

      // ⛔ Bloquear administradores
      if (rol === "ADMINISTRADOR" || rol === "SUBADMINISTRADOR") {
        await Swal.fire({
          icon: "warning",
          title: "Acceso no permitido",
          text: "Este login es solo para Club, Competidor y Juez",
        });
        return;
      }

      // ✅ Guardar sesión
      login({
        token,
        rol,
        usuario: entidad,
      });

      await Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `Rol detectado correctamente: ${rol}`,
      });

      const rutasPorRol = {
        CLUB: "/club",
        COMPETIDOR: "/competidor",
        JUEZ: "/juez",
      };

      navigate(rutasPorRol[rol] || "/");

    } catch (error) {
      Swal.close();

      const mensaje =
        typeof error?.response?.data === "string"
          ? error.response.data
          : "Correo o contraseña incorrectos";

      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: mensaje,
      });
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav
        className="navbar navbar-expand-lg"
        style={{ backgroundColor: "#00b3b3" }}
      >
        <div className="container">
          <a className="navbar-brand" href="/">
            <img src="/img/logo.jpg" alt="Logo" height="50" />
          </a>
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
              Iniciar sesión
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
                  placeholder="Contraseña"
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
                  ¿Olvidaste tu contraseña?
                </a>
                <p className="small mb-0">
                  ¿No tienes cuenta?{" "}
                  <a href="#" className="text-primary fw-bold">
                    Regístrate
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
