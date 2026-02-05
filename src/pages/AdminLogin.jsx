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

      const roles = Array.isArray(res.data.roles) ? res.data.roles : [];

      // ? Guardar datos correctamente
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("token", res.data.token);

      // ? Configurar axios para futuras peticiones protegidas
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${res.data.token}`;

      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: `${res.data.usuario.correo} (${roles.join(", ")})`
      });

      // ? Redireccion CORRECTA segun roles reales de la BD
      if (roles.includes("ADMINISTRADOR")) {
        window.location.href = "/admin";
        return;
      }

      if (roles.includes("SUBADMINISTRADOR")) {
        window.location.href = "/subadmin";
        return;
      }

      Swal.fire("Error", "Rol no autorizado", "error");

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
            placeholder="Contrasena"
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
