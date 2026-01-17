import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FaUserPlus, FaEdit, FaTrash, FaKey, FaSearch, FaUserShield, FaEnvelope, FaPhone } from "react-icons/fa";
import api from "../../services/axiosConfig"; // Asegúrate de que apunte a tu configuración de axios

const ROLES = ["ADMINISTRADOR", "SUBADMINISTRADOR", "JUEZ", "CLUB", "COMPETIDOR"];
const ESTADOS = ["ACTIVO", "INACTIVO", "PENDIENTE"];

export default function AdminUsuarios() {
  // ============================
  // ESTADOS
  // ============================
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modales
  const [modal, setModal] = useState(false);
  const [modalPass, setModalPass] = useState(false);
  
  // Identificadores para edición
  const [editingId, setEditingId] = useState(null);
  const [passId, setPassId] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: "",
    rol: "",
    estado: "ACTIVO",
  });

  const [newPass, setNewPass] = useState("");
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  // ============================
  // CARGA DE DATOS
  // ============================
  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/usuarios");
      // Aseguramos que sea un array para evitar errores de map
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar la lista de usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // ============================
  // FILTRADO (SOLO VISUAL EN FRONTEND)
  // ============================
  const usuariosFiltrados = useMemo(() => {
    const term = busqueda.toLowerCase();
    return usuarios.filter(u => 
      (u.nombres?.toLowerCase() || "").includes(term) ||
      (u.apellidos?.toLowerCase() || "").includes(term) ||
      (u.correo?.toLowerCase() || "").includes(term) ||
      (u.rol?.toLowerCase() || "").includes(term)
    );
  }, [usuarios, busqueda]);

  // ============================
  // GESTIÓN DE FORMULARIO
  // ============================
  const resetForm = () => {
    setForm({
      nombres: "", apellidos: "", correo: "", telefono: "",
      contrasena: "", rol: "", estado: "ACTIVO"
    });
  };

  const abrirCrear = () => {
    resetForm();
    setEditingId(null);
    setModal(true);
  };

  const abrirEditar = (u) => {
    setEditingId(u.idUsuario);
    setForm({
      nombres: u.nombres ?? "",
      apellidos: u.apellidos ?? "",
      correo: u.correo ?? "",
      telefono: u.telefono ?? "",
      contrasena: "", // No cargamos la contraseña por seguridad
      rol: u.rol ?? "",
      estado: u.estado ?? "ACTIVO",
    });
    setModal(true);
  };

  // ============================
  // GUARDAR (LÓGICA DELEGADA AL BACKEND)
  // ============================
  const guardar = async () => {
    // 1. Validación mínima de UI (campos visualmente requeridos)
    if (!form.nombres || !form.apellidos || !form.correo || !form.rol) {
      return Swal.fire("Atención", "Por favor completa los campos obligatorios (*)", "warning");
    }

    try {
      // 2. Preparamos el payload
      const payload = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        rol: form.rol,
        estado: form.estado,
        // Solo enviamos contraseña si estamos creando uno nuevo
        ...( !isEditing && { contrasena: form.contrasena } ) 
      };

      // 3. Enviamos al Backend (quien hará las validaciones fuertes de negocio)
      if (!isEditing) {
        await api.post("/admin/usuarios", payload);
        Swal.fire({ icon: 'success', title: 'Creado', text: 'Usuario registrado correctamente', timer: 1500, showConfirmButton: false });
      } else {
        await api.put(`/admin/usuarios/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Datos modificados correctamente', timer: 1500, showConfirmButton: false });
      }

      setModal(false);
      cargar(); // Recargamos la lista

    } catch (err) {
      // 4. Manejo de Errores del Backend
      // Mostramos el mensaje específico que envíe el backend (ej: "Correo duplicado")
      const msg = err.response?.data?.mensaje || err.response?.data || "Error al procesar la solicitud";
      Swal.fire("Error", msg, "error");
    }
  };

  // ============================
  // ELIMINAR / PASSWORD
  // ============================
  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El backend determinará si se elimina físicamente o se desactiva.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, proceder"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/usuarios/${id}`);
        Swal.fire("Procesado", "Acción realizada correctamente.", "success");
        cargar();
      } catch (err) {
        const msg = err.response?.data?.mensaje || "No se pudo eliminar el usuario";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const cambiarPassword = async () => {
    if (!newPass.trim()) return Swal.fire("Error", "La contraseña no puede estar vacía", "warning");
    
    try {
      // El backend validará longitud, complejidad, etc.
      await api.put(`/admin/usuarios/${passId}/password`, newPass, { 
          headers: { "Content-Type": "text/plain" } 
      });
      Swal.fire("Éxito", "Contraseña actualizada", "success");
      setModalPass(false);
      setNewPass("");
    } catch (err) {
      const msg = err.response?.data?.mensaje || "No se pudo cambiar la contraseña. Revisa que cumpla los requisitos.";
      Swal.fire("Error", msg, "error");
    }
  };

  // ============================
  // RENDER UI (Sin cambios visuales)
  // ============================
  return (
    <div className="container-fluid">
      
      {/* HEADER & TOOLBAR */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaUserShield className="me-2 text-primary" />
            Administración de Usuarios
          </h2>
          <p className="text-muted mb-0">Gestiona accesos, roles y estados de la plataforma.</p>
        </div>
        
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={abrirCrear}>
          <FaUserPlus /> Nuevo Usuario
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-0"><FaSearch className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control border-0" 
              placeholder="Buscar por nombre, correo, rol..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Usuario</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No se encontraron usuarios.</td></tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr key={u.idUsuario}>
                      {/* COLUMNA USUARIO */}
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 fw-bold shadow-sm" 
                               style={{width: '40px', height: '40px', fontSize: '0.9rem'}}>
                            {u.nombres?.charAt(0)}{u.apellidos?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{u.nombres} {u.apellidos}</div>
                            <small className="text-muted">ID: {u.idUsuario}</small>
                          </div>
                        </div>
                      </td>

                      {/* COLUMNA CONTACTO */}
                      <td>
                        <div className="d-flex flex-column small">
                          <span className="text-secondary"><FaEnvelope className="me-1"/> {u.correo}</span>
                          {u.telefono && <span className="text-muted"><FaPhone className="me-1"/> {u.telefono}</span>}
                        </div>
                      </td>

                      {/* COLUMNA ROL */}
                      <td>
                        <span className={`badge rounded-pill border ${
                          u.rol === "ADMINISTRADOR" ? "bg-dark text-white border-dark" :
                          u.rol === "JUEZ" ? "bg-info-subtle text-info-emphasis border-info" :
                          "bg-light text-secondary border-secondary"
                        }`}>
                          {u.rol}
                        </span>
                      </td>

                      {/* COLUMNA ESTADO */}
                      <td>
                          <span className={`badge ${
                           u.estado === "ACTIVO" ? "bg-success-subtle text-success" :
                           u.estado === "PENDIENTE" ? "bg-warning-subtle text-warning-emphasis" :
                           "bg-danger-subtle text-danger"
                          }`}>
                            {u.estado}
                          </span>
                      </td>

                      {/* COLUMNA ACCIONES */}
                      <td className="text-end pe-4">
                        <div className="btn-group">
                          <button className="btn btn-outline-secondary btn-sm" title="Cambiar Contraseña" 
                                  onClick={() => { setPassId(u.idUsuario); setNewPass(""); setModalPass(true); }}>
                            <FaKey />
                          </button>
                          <button className="btn btn-outline-primary btn-sm" title="Editar" 
                                  onClick={() => abrirEditar(u)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-outline-danger btn-sm" title="Eliminar" 
                                  onClick={() => eliminar(u.idUsuario)}>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL CREAR / EDITAR --- */}
      {modal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Nombres *</label>
                    <input className="form-control" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Apellidos *</label>
                    <input className="form-control" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Correo Electrónico *</label>
                    <input type="email" className="form-control" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Teléfono</label>
                    <input className="form-control" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Rol *</label>
                    <select className="form-select" value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}>
                      <option value="">-- Seleccionar --</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  
                  {!isEditing && (
                    <div className="col-12">
                        <label className="form-label small fw-bold">Contraseña Inicial *</label>
                        <input type="password" className="form-control" value={form.contrasena} onChange={e => setForm({...form, contrasena: e.target.value})} placeholder="Definida por el backend si vacía" />
                    </div>
                  )}

                  <div className="col-12 mt-3">
                    <label className="form-label small fw-bold">Estado de la cuenta</label>
                    <select className="form-select" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button className="btn btn-primary px-4" onClick={guardar}>{isEditing ? "Guardar Cambios" : "Crear Usuario"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CAMBIAR PASSWORD --- */}
      {modalPass && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h6 className="modal-title fw-bold"><FaKey className="me-2"/>Cambiar Contraseña</h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalPass(false)}></button>
              </div>
              <div className="modal-body">
                <input type="password" className="form-control text-center" placeholder="Nueva contraseña" 
                       value={newPass} onChange={e => setNewPass(e.target.value)} />
                <div className="form-text text-center small mt-1">El backend validará la seguridad</div>
              </div>
              <div className="modal-footer justify-content-center bg-light">
                <button className="btn btn-dark w-100" onClick={cambiarPassword}>Actualizar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}