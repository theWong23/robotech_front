import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig"; 

export default function AdminJueces() {
  const [jueces, setJueces] = useState([]);
  const [form, setForm] = useState({
    correo: "",
    telefono: "",
    contrasena: "",
    licencia: ""
  });

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // =========================
  // 1. OBTENER ID DEL ADMIN
  // =========================
  const getAdminId = () => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      if (!usuarioStr) return null;
      const usuario = JSON.parse(usuarioStr);
      return usuario.idUsuario || usuario.entidad?.idUsuario || usuario.id;
    } catch (e) {
      console.error("Error leyendo usuario del storage", e);
      return null;
    }
  };

  const adminId = getAdminId();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const res = await api.get("/admin/jueces");
      setJueces(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar la lista de jueces", "error");
    }
  };

  const abrirCrear = () => {
    setForm({ correo: "", telefono: "", contrasena: "", licencia: "" });
    setEditingId(null);
    setModal(true);
  };

  const validarCampos = () => {
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telRegex = /^[0-9]{9}$/;

    if (!correoRegex.test(form.correo)) {
      Swal.fire("Correo inválido", "Ingresa un correo válido", "warning");
      return false;
    }
    if (!telRegex.test(form.telefono)) {
      Swal.fire("Teléfono inválido", "Debe tener 9 dígitos", "warning");
      return false;
    }
    if (!editingId && form.contrasena.length < 6) {
      Swal.fire("Contraseña débil", "Debe tener mínimo 6 caracteres", "warning");
      return false;
    }
    return true;
  };

  const guardar = async () => {
    if (!validarCampos()) return;
    if (!adminId) {
      Swal.fire("Error de Sesión", "No se identifica al administrador. Relogueate.", "error");
      return;
    }

    try {
      if (!editingId) {
        await api.post("/admin/jueces", { ...form, creadoPor: adminId });
        Swal.fire("✔ Juez creado correctamente", "", "success");
      } else {
        await api.put(`/admin/jueces/${editingId}`, form);
        Swal.fire("✔ Datos actualizados", "", "success");
      }
      setModal(false);
      cargar();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar la información", "error");
    }
  };

  const eliminar = async (idJuez) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar juez?",
      text: "Esta acción es irreversible",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/admin/jueces/${idJuez}`);
      Swal.fire("Juez eliminado", "", "success");
      cargar();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar al juez", "error");
    }
  };

  // =========================
  // APROBAR (CORREGIDO)
  // =========================
  const aprobar = async (idJuez) => {
    if (!adminId) {
      Swal.fire("Error", "Sesión inválida", "error");
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Aprobar juez?",
      icon: "question",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/admin/jueces/${idJuez}/aprobar`, {}, {
        headers: { "admin-id": adminId }
      });
      Swal.fire("✔ Juez aprobado", "", "success");
      cargar();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo aprobar al juez", "error");
    }
  };

  // =========================
  // RECHAZAR (CORREGIDO)
  // =========================
  const rechazar = async (idJuez) => {
    if (!adminId) return;

    const confirm = await Swal.fire({
      title: "¿Rechazar juez?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/admin/jueces/${idJuez}/rechazar`, {}, {
        headers: { "admin-id": adminId }
      });
      Swal.fire("✔ Juez rechazado", "", "success");
      cargar();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo rechazar al juez", "error");
    }
  };

  const formatFecha = (f) => f ? new Date(f).toLocaleString() : "—";

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Gestión de Jueces</h2>
      <button className="btn btn-primary my-3" onClick={abrirCrear}>
        ➕ Crear Juez
      </button>

      <div className="table-responsive">
        <table className="table table-bordered shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Licencia</th>
              <th>Estado</th>
              <th>Creado por</th>
              <th>Creado en</th>
              <th>Validado por</th>
              <th>Validado en</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {jueces.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
                  No hay jueces registrados
                </td>
              </tr>
            ) : jueces.map(j => (
              <tr key={j.idJuez}>
                <td>{j.usuario?.correo}</td>
                <td>{j.usuario?.telefono}</td>
                <td>{j.licencia}</td>
                <td>
                  <span className={`badge ${
                    j.estadoValidacion === "APROBADO" ? "bg-success" :
                    j.estadoValidacion === "RECHAZADO" ? "bg-danger" : "bg-warning text-dark"
                  }`}>
                    {j.estadoValidacion}
                  </span>
                </td>
                <td>{j.creadoPor ?? "—"}</td>
                <td>{formatFecha(j.creadoEn)}</td>
                <td>{j.validadoPor ?? "—"}</td>
                <td>{formatFecha(j.validadoEn)}</td>
                <td>
                  <div className="d-flex gap-2">
                    {j.estadoValidacion === "PENDIENTE" && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => aprobar(j.idJuez)}>
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => rechazar(j.idJuez)}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </>
                    )}
                    <button className="btn btn-warning btn-sm" onClick={() => {
                      setEditingId(j.idJuez);
                      setForm({
                        correo: j.usuario?.correo || "",
                        telefono: j.usuario?.telefono || "",
                        contrasena: "",
                        licencia: j.licencia
                      });
                      setModal(true);
                    }}>✏️</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => eliminar(j.idJuez)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 shadow">
              <h4 className="fw-bold mb-3">{editingId ? "Editar Juez" : "Crear Juez"}</h4>
              <div className="mb-2">
                <label className="form-label">Correo Electrónico</label>
                <input className="form-control" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Teléfono</label>
                <input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} maxLength={9} />
              </div>
              {!editingId && (
                <div className="mb-2">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-control" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Licencia</label>
                <input className="form-control" value={form.licencia} onChange={e => setForm({ ...form, licencia: e.target.value })} />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={guardar}>{editingId ? "Actualizar" : "Guardar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}