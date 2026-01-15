import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

const ROLES = [
  "ADMINISTRADOR",
  "SUBADMINISTRADOR",
  "JUEZ",
  "CLUB",
  "COMPETIDOR",
];

const ESTADOS = ["ACTIVO", "INACTIVO", "PENDIENTE"];

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  const [modal, setModal] = useState(false);
  const [modalPass, setModalPass] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [passId, setPassId] = useState(null);

  // Form: ahora incluye nombres/apellidos
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: "", // solo para crear
    rol: "",
    estado: "ACTIVO",
  });

  const [newPass, setNewPass] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  // ============================
  // HELPERS
  // ============================
  const handleApiError = (err, fallbackMsg) => {
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.mensaje ||
      err?.response?.data ||
      fallbackMsg ||
      "Ocurrió un error";

    if (status === 403) {
      Swal.fire("Acceso denegado", "No tienes permisos para esta acción", "error");
      return;
    }
    if (status === 409) {
      Swal.fire("Conflicto", msg, "warning");
      return;
    }
    if (status === 400) {
      Swal.fire("Datos inválidos", msg, "warning");
      return;
    }

    Swal.fire("Error", msg, "error");
  };

  const resetForm = () => {
    setForm({
      nombres: "",
      apellidos: "",
      correo: "",
      telefono: "",
      contrasena: "",
      rol: "",
      estado: "ACTIVO",
    });
  };

  // ============================
  // CARGAR
  // ============================
  const cargar = async () => {
    try {
      const res = await api.get("/admin/usuarios");
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      handleApiError(err, "No se pudo cargar la lista de usuarios");
      setUsuarios([]);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // ============================
  // VALIDACIONES
  // ============================
  const validarCampos = () => {
    // nombres/apellidos (mínimo razonable)
    if (!form.nombres?.trim() || form.nombres.trim().length < 2) {
      Swal.fire("Error", "Nombres obligatorios", "warning");
      return false;
    }
    if (!form.apellidos?.trim() || form.apellidos.trim().length < 2) {
      Swal.fire("Error", "Apellidos obligatorios", "warning");
      return false;
    }

    // correo
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(form.correo)) {
      Swal.fire("Error", "Correo inválido", "warning");
      return false;
    }

    // teléfono
    if (!/^[0-9]{9}$/.test(form.telefono)) {
      Swal.fire("Error", "Teléfono inválido (9 dígitos)", "warning");
      return false;
    }

    // rol
    if (!form.rol) {
      Swal.fire("Error", "Selecciona un rol", "warning");
      return false;
    }

    // estado
    if (!form.estado) {
      Swal.fire("Error", "Selecciona un estado", "warning");
      return false;
    }

    // contraseña solo al crear
    if (!isEditing) {
      if (!form.contrasena || form.contrasena.length < 8) {
        Swal.fire("Error", "La contraseña debe tener al menos 8 caracteres", "warning");
        return false;
      }
    }

    return true;
  };

  // ============================
  // ABRIR MODALES
  // ============================
  const abrirCrear = () => {
    resetForm();
    setEditingId(null);
    setModal(true);
  };

  const abrirEditar = (u) => {
    setEditingId(u.idUsuario);

    // Importante: no copies campos que no existen o que el backend no espera
    setForm({
      nombres: u.nombres ?? "",
      apellidos: u.apellidos ?? "",
      correo: u.correo ?? "",
      telefono: u.telefono ?? "",
      contrasena: "", // no se edita aquí
      rol: u.rol ?? "",
      estado: u.estado ?? "ACTIVO",
    });

    setModal(true);
  };

  const abrirPass = (idUsuario) => {
    setPassId(idUsuario);
    setNewPass("");
    setModalPass(true);
  };

  // ============================
  // GUARDAR (CREATE / UPDATE)
  // ============================
  const guardar = async () => {
    if (!validarCampos()) return;

    try {
      if (!isEditing) {
        // CREATE: manda password
        const payload = {
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono.trim(),
          contrasena: form.contrasena,
          rol: form.rol,
          estado: form.estado,
        };

        await api.post("/admin/usuarios", payload);
        Swal.fire("✔ Usuario creado", "", "success");
      } else {
        // UPDATE: NO manda contrasena (se cambia en modal pass)
        const payload = {
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          correo: form.correo.trim(),
          telefono: form.telefono.trim(),
          rol: form.rol,
          estado: form.estado,
        };

        await api.put(`/admin/usuarios/${editingId}`, payload);
        Swal.fire("✔ Usuario actualizado", "", "success");
      }

      setModal(false);
      await cargar();
    } catch (err) {
      handleApiError(err, "No se pudo guardar el usuario");
    }
  };

  // ============================
  // ELIMINAR / DESACTIVAR
  // ============================
  const eliminar = async (id) => {
    const conf = await Swal.fire({
      title: "¿Desactivar usuario?",
      text: "Recomendado: desactivar en vez de borrar físicamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });

    if (!conf.isConfirmed) return;

    try {
      // ✅ Recomendado: endpoint de desactivación (si lo tienes)
      // await api.put(`/api/admin/usuarios/${id}/desactivar`);

      // ✅ Si tu backend aún usa DELETE (ojo con FK)
      await api.delete(`/admin/usuarios/${id}`);

      Swal.fire("Listo", "Usuario desactivado/eliminado", "success");
      await cargar();
    } catch (err) {
      handleApiError(err, "No se pudo eliminar/desactivar el usuario");
    }
  };

  // ============================
  // CONTRASEÑA
  // ============================
  const guardarPass = async () => {
    if (!newPass || newPass.length < 8) {
      Swal.fire("Error", "La contraseña debe tener al menos 8 caracteres", "warning");
      return;
    }

    try {
      await api.put(
        `/admin/usuarios/${passId}/password`,
        newPass,
        { headers: { "Content-Type": "text/plain" } }
      );

      Swal.fire("✔ Contraseña actualizada", "", "success");
      setModalPass(false);
      setNewPass("");
    } catch (err) {
      handleApiError(err, "No se pudo actualizar la contraseña");
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
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th style={{ width: 220 }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No hay usuarios
              </td>
            </tr>
          ) : (
            usuarios.map((u) => (
              <tr key={u.idUsuario}>
                <td>{u.idUsuario}</td>
                <td>{`${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim() || "—"}</td>
                <td>{u.correo}</td>
                <td>{u.telefono}</td>
                <td>{u.rol}</td>
                <td>
                  <span
                    className={`badge ${
                      u.estado === "ACTIVO"
                        ? "bg-success"
                        : u.estado === "PENDIENTE"
                        ? "bg-warning text-dark"
                        : "bg-secondary"
                    }`}
                  >
                    {u.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => abrirEditar(u)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => abrirPass(u.idUsuario)}
                  >
                    Contraseña
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminar(u.idUsuario)}
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL USUARIO */}
      {modal && (
        <div className="modal d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h4>{isEditing ? "Editar Usuario" : "Crear Usuario"}</h4>

              <input
                className="form-control mt-2"
                placeholder="Nombres"
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
              />

              <input
                className="form-control mt-2"
                placeholder="Apellidos"
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
              />

              <input
                className="form-control mt-2"
                placeholder="Correo"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />

              <input
                className="form-control mt-2"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />

              {!isEditing && (
                <input
                  type="password"
                  className="form-control mt-2"
                  placeholder="Contraseña (mín. 8)"
                  value={form.contrasena}
                  onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                />
              )}

              <select
                className="form-control mt-2"
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
              >
                <option value="">Seleccione rol</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                className="form-control mt-2"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                {ESTADOS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <div className="mt-3 text-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={guardar}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PASSWORD */}
      {modalPass && (
        <div className="modal d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h4>Cambiar Contraseña</h4>

              <input
                type="password"
                className="form-control mt-2"
                placeholder="Nueva contraseña (mín. 8)"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />

              <div className="mt-3 text-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setModalPass(false);
                    setNewPass("");
                  }}
                >
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={guardarPass}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
