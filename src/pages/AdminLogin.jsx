import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";

export default function AdminLogin() {

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const ingresar = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: "Validando credenciales...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await axios.post(
        "http://localhost:8080/api/admin/login",
        {
          correo,
          contrasena
        }
      );

      Swal.close();

      // ✅ Guardar datos correctamente
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
      localStorage.setItem("rol", res.data.rol);
      localStorage.setItem("token", res.data.token);

      // ✅ Configurar axios para futuras peticiones protegidas
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${res.data.token}`;

      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `${res.data.usuario.correo} (${res.data.rol})`
      });

      // ✅ Redirección CORRECTA según rol real de la BD
      switch (res.data.rol) {
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
      Swal.fire(
        "Error",
        "Credenciales incorrectas o acceso no autorizado",
        "error"
      );
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", background: "#f5f7fa" }}
    >
      <div
        className="card shadow p-4"
        style={{ width: "380px", borderRadius: "12px" }}
      >
        <h3 className="text-center fw-bold mb-3 text-danger">
          Acceso Administrativo
        </h3>

        <form onSubmit={ingresar}>
          <input
            type="email"
            className="form-control mb-3"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <input
            type="password"
            className="form-control mb-3"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />

          <button className="btn btn-danger w-100" type="submit">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
