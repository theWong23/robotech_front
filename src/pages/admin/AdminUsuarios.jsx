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
  // CARGAR USUARIOS (ANTES del useEffect)
  // ============================
  const cargar = async () => {
    try {
      const res = await api.get("/api/admin/usuarios");
      setUsuarios(res.data);
    } catch {
      Swal.fire("Error", "No se pudo cargar la lista de usuarios", "error");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // ============================
  // VALIDACIONES
  // ============================
  const validarCampos = () => {
    if (!form.correo.includes("@")) {
      Swal.fire("Error", "Correo inválido", "error");
      return false;
    }
    if (!/^[0-9]{9}$/.test(form.telefono)) {
      Swal.fire("Error", "Teléfono inválido", "error");
      return false;
    }
    if (!editingId && form.contrasena.length < 5) {
      Swal.fire("Error", "Contraseña muy corta", "error");
      return false;
    }
    return true;
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
        Swal.fire("✔ Usuario actualizado", "", "success");
      }

      setModal(false);
      cargar();
    } catch {
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

    await api.delete(`/api/admin/usuarios/${id}`);
    Swal.fire("Eliminado", "", "success");
    cargar();
  };

  // ============================
  // CONTRASEÑA
  // ============================
  const guardarPass = async () => {
    if (newPass.length < 5) {
      Swal.fire("Error", "Contraseña muy corta", "error");
      return;
    }

    await api.put(
      `/api/admin/usuarios/${passId}/password`,
      newPass,
      { headers: { "Content-Type": "text/plain" } }
    );

    Swal.fire("✔ Contraseña actualizada", "", "success");
    setModalPass(false);
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="container mt-4">

      <h2 className="fw-bold mb-3">Gestión de Usuarios</h2>

      <button className="btn btn-primary mb-3" onClick={() => {
        setForm({
          correo: "",
          telefono: "",
          contrasena: "",
          rol: "",
          estado: "ACTIVO",
        });
        setEditingId(null);
        setModal(true);
      }}>
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
                <button className="btn btn-warning btn-sm me-2" onClick={() => {
                  setEditingId(u.idUsuario);
                  setForm({ ...u, contrasena: "" });
                  setModal(true);
                }}>
                  Editar
                </button>

                <button className="btn btn-info btn-sm me-2" onClick={() => {
                  setPassId(u.idUsuario);
                  setModalPass(true);
                }}>
                  Contraseña
                </button>

                <button className="btn btn-danger btn-sm" onClick={() => eliminar(u.idUsuario)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL USUARIO */}
      {modal && (
        <div className="modal d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h4>{editingId ? "Editar Usuario" : "Crear Usuario"}</h4>

              <input className="form-control mt-2" placeholder="Correo"
                value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })}
              />

              <input className="form-control mt-2" placeholder="Teléfono"
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
              />

              {!editingId && (
                <input type="password" className="form-control mt-2" placeholder="Contraseña"
                  value={form.contrasena}
                  onChange={e => setForm({ ...form, contrasena: e.target.value })}
                />
              )}

              <select className="form-control mt-2"
                value={form.rol}
                onChange={e => setForm({ ...form, rol: e.target.value })}>
                <option value="">Seleccione rol</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="SUBADMINISTRADOR">SUBADMINISTRADOR</option>
                <option value="JUEZ">JUEZ</option>
                <option value="CLUB">CLUB</option>
                <option value="COMPETIDOR">COMPETIDOR</option>
              </select>

              <div className="mt-3 text-end">
                <button className="btn btn-secondary me-2" onClick={() => setModal(false)}>Cancelar</button>
                <button className="btn btn-success" onClick={guardar}>Guardar</button>
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

              <input type="password" className="form-control mt-2"
                placeholder="Nueva contraseña"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
              />

              <div className="mt-3 text-end">
                <button className="btn btn-secondary me-2" onClick={() => setModalPass(false)}>Cancelar</button>
                <button className="btn btn-success" onClick={guardarPass}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
