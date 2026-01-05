import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

export default function AdminUsuarios() {

  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalPass, setModalPass] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [passId, setPassId] = useState(null);

  const [form, setForm] = useState({
    correo: "",
    telefono: "",
    contrasena: "",
    rol: "",
    estado: "ACTIVO",
  });

  const [newPass, setNewPass] = useState("");

  // ============================
  // CARGAR USUARIOS
  // ============================
  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const res = await api.get("/api/admin/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      Swal.fire("Error", "No se pudo cargar la lista de usuarios", "error");
    }
  };

  // ============================
  // VALIDACIONES
  // ============================
  const validarCampos = () => {
    if (!form.correo.includes("@")) {
      Swal.fire("Error", "Correo inválido", "error");
      return false;
    }
    if (!/^[0-9]{9}$/.test(form.telefono)) {
      Swal.fire("Error", "El teléfono debe tener 9 dígitos", "error");
      return false;
    }
    if (!editingId && form.contrasena.length < 5) {
      Swal.fire("Error", "La contraseña debe tener al menos 5 caracteres", "error");
      return false;
    }
    return true;
  };

  // ============================
  // ABRIR MODAL
  // ============================
  const abrirCrear = () => {
    setForm({
      correo: "",
      telefono: "",
      contrasena: "",
      rol: "",
      estado: "ACTIVO",
    });
    setEditingId(null);
    setModal(true);
  };

  // ============================
  // GUARDAR
  // ============================
  const guardar = async () => {
    if (!validarCampos()) return;

    try {
      if (!editingId) {
        await api.post("/api/admin/usuarios", form);
        Swal.fire("✔ Usuario creado", "", "success");
      } else {
        await api.put(`/api/admin/usuarios/${editingId}`, form);
        Swal.fire("✔ Usuario editado", "", "success");
      }

      setModal(false);
      cargar();

    } catch (err) {
      Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  // ============================
  // ELIMINAR
  // ============================
  const eliminar = async (id) => {
    const conf = await Swal.fire({
      title: "¿Eliminar usuario?",
      icon: "warning",
      showCancelButton: true
    });

    if (!conf.isConfirmed) return;

    try {
      await api.delete(`/api/admin/usuarios/${id}`);
      Swal.fire("Eliminado", "", "success");
      cargar();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  // ============================
  // CAMBIAR ESTADO
  // ============================
  const cambiarEstado = async (id, estado) => {
    try {
      await api.put(
        `/api/admin/usuarios/${id}/estado`,
        estado,
        { headers: { "Content-Type": "text/plain" } }
      );
      cargar();
    } catch (err) {
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }
  };

  // ============================
  // CONTRASEÑA
  // ============================
  const abrirCambiarPass = (id) => {
    setPassId(id);
    setNewPass("");
    setModalPass(true);
  };

  const guardarPass = async () => {
    if (newPass.length < 5) {
      Swal.fire("Error", "Contraseña muy corta", "error");
      return;
    }

    try {
      await api.put(
        `/api/admin/usuarios/${passId}/password`,
        newPass,
        { headers: { "Content-Type": "text/plain" } }
      );

      Swal.fire("✔ Contraseña actualizada", "", "success");
      setModalPass(false);
    } catch (err) {
      Swal.fire("Error", "No se pudo cambiar la contraseña", "error");
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="container mt-4">

      <h2 className="fw-bold mb-3">Gestión de Usuarios</h2>

      <button className="btn btn-primary mb-3" onClick={abrirCrear}>
        ➕ Crear Usuario
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map(u => (
            <tr key={u.idUsuario}>
              <td>{u.idUsuario}</td>
              <td>{u.correo}</td>
              <td>{u.telefono}</td>
              <td>{u.rol}</td>
              <td>
                <span className={`badge ${u.estado === "ACTIVO" ? "bg-success" : "bg-danger"}`}>
                  {u.estado}
                </span>
              </td>
              <td>
                <button className="btn btn-warning btn-sm me-2"
                  onClick={() => {
                    setEditingId(u.idUsuario);
                    setForm({ ...u, contrasena: "" });
                    setModal(true);
                  }}>
                  Editar
                </button>

                <button className="btn btn-info btn-sm me-2"
                  onClick={() => abrirCambiarPass(u.idUsuario)}>
                  Contraseña
                </button>

                <button className="btn btn-danger btn-sm"
                  onClick={() => eliminar(u.idUsuario)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
