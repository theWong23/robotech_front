import { useEffect, useState, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCheck, FaTimes, FaUserTie, FaEnvelope, FaPhone, FaIdCard, FaBan } from "react-icons/fa";
import api from "../../services/axiosConfig";
import { consultarDni } from "../../services/dniService";

export default function AdminJueces() {
  // =========================
  // ESTADOS
  // =========================
  const [jueces, setJueces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    dni: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: "",
    licencia: ""
  };

  const [form, setForm] = useState(initialForm);

  // =========================
  // UTILS
  // =========================
  const getAdminId = () => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      if (!usuarioStr) return null;
      const usuario = JSON.parse(usuarioStr);
      // Intentamos obtener el ID de diferentes estructuras posibles
      return usuario.idUsuario || usuario.id || (usuario.entidad && usuario.entidad.idUsuario);
    } catch (e) { return null; }
  };

  const adminId = getAdminId();

  const cargarPorDni = async () => {
    try {
      Swal.fire({
        title: "Consultando DNI...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
  
      const data = await consultarDni(form.dni);
  
      setForm(prev => ({
        ...prev,
        nombres: data.nombres,
        apellidos: data.apellidos
      }));
  
      Swal.close();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };
  // =========================
  // CARGA DE DATOS
  // =========================
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/jueces");
      setJueces(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar jueces:", err);
      Swal.fire("Error", "No se pudo sincronizar la lista de jueces", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // =========================
  // FILTRADO (VISUAL)
  // =========================
  const juecesFiltrados = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return jueces.filter((j) => 
      (j.usuario?.dni?.toLowerCase() || "").includes(term) ||
      (j.usuario?.nombres?.toLowerCase() || "").includes(term) ||
      (j.usuario?.apellidos?.toLowerCase() || "").includes(term) ||
      (j.usuario?.correo?.toLowerCase() || "").includes(term) ||
      (j.licencia?.toLowerCase() || "").includes(term)
    );
  }, [jueces, searchTerm]);

  // =========================
  // MANEJO DEL FORMULARIO
  // =========================
  const abrirCrear = () => {
    setForm(initialForm);
    setEditingId(null);
    setModal(true);
  };

  const abrirEditar = (j) => {
    setEditingId(j.idJuez);
    setForm({
      dni: j.usuario?.dni || "",
      nombres: j.usuario?.nombres || "",
      apellidos: j.usuario?.apellidos || "",
      correo: j.usuario?.correo || "",
      telefono: j.usuario?.telefono || "",
      contrasena: "", // Siempre vacío en edición por seguridad
      licencia: j.licencia || ""
    });
    setModal(true);
  };

  const guardar = async () => {
    // 1. Validaciones básicas de campos
    if (!form.dni.trim() || !form.nombres.trim() || !form.apellidos.trim() || !form.correo.trim() || !form.licencia.trim()) {
      return Swal.fire("Atención", "Nombre, Apellidos, Correo y Licencia son campos obligatorios", "warning");
    }
    
    if (!editingId && !form.contrasena.trim()) {
        return Swal.fire("Atención", "La contraseña es obligatoria para nuevos registros", "warning");
    }

    if (!adminId) return Swal.fire("Error", "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.", "error");

    try {
      const payload = { ...form };
      
      // Limpiar campos antes de enviar
      payload.nombres = payload.nombres.trim();
      payload.apellidos = payload.apellidos.trim();
      payload.correo = payload.correo.trim();

      if (!editingId) {
        // ✅ CREAR: El backend ya mapea nombres y apellidos al Usuario
        await api.post("/admin/jueces", { ...payload, creadoPor: adminId });
        Swal.fire({ icon: 'success', title: '¡Juez Registrado!', timer: 1500, showConfirmButton: false });
      } else {
        // ✅ EDITAR: Si la contraseña está vacía, no se envía para no sobreescribir la actual
        if (!payload.contrasena || !payload.contrasena.trim()) {
            delete payload.contrasena;
        }
        await api.put(`/admin/jueces/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: '¡Datos Actualizados!', timer: 1500, showConfirmButton: false });
      }

      setModal(false);
      cargar(); // 🔄 Sincronización inmediata con la base de datos
    } catch (err) {
      const errorMsg = err.response?.data?.mensaje || "Error al procesar la solicitud en el servidor";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  const eliminar = async (idJuez) => {
    const result = await Swal.fire({ 
        title: "¿Eliminar Juez?", 
        text: "Esta acción podría afectar el historial de competencias.",
        icon: "warning", 
        showCancelButton: true, 
        confirmButtonColor: "#d33", 
        confirmButtonText: "Sí, eliminar" 
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/jueces/${idJuez}`);
        Swal.fire("Éxito", "Juez removido correctamente.", "success");
        cargar();
      } catch { Swal.fire("Error", "No se pudo eliminar el registro", "error"); }
    }
  };

  const inactivarLicencia = async (idJuez) => {
    const result = await Swal.fire({
      title: "?Inactivar licencia?",
      text: "El juez dejar? de calificar y solo podr? competir.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "S?, inactivar",
      confirmButtonColor: "#d33"
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/jueces/${idJuez}/inactivar`, {}, { headers: { "admin-id": adminId } });
      Swal.fire("Listo", "Licencia inactivada", "success");
      cargar();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo inactivar";
      Swal.fire("Error", msg, "error");
    }
  };

  const cambiarEstado = async (idJuez, accion) => {
    try {
      await api.put(`/admin/jueces/${idJuez}/${accion}`, {}, { headers: { "admin-id": adminId } });
      Swal.fire("Éxito", `El juez ha sido ${accion === 'aprobar' ? 'aprobado' : 'rechazado'}`, "success");
      cargar();
    } catch { Swal.fire("Error", "Fallo al cambiar el estado de validación", "error"); }
  };

  // =========================
  // RENDER UI
  // =========================
  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaUserTie className="me-2 text-primary"/>Gestión de Jueces</h2>
          <p className="text-muted mb-0">Control de credenciales y validación de licencias técnicas.</p>
        </div>
        <button className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold" onClick={abrirCrear}>
          <FaPlus className="me-2" /> REGISTRAR NUEVO JUEZ
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4 rounded-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control border-0 shadow-none" 
              placeholder="Filtrar por nombre, correo o número de licencia..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-secondary small text-uppercase">
              <tr>
                <th className="ps-4">Juez / Identidad</th>
                <th>dni</th>
                <th>Contacto</th>
                <th>Licencia</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : juecesFiltrados.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted py-5">No se encontraron jueces con los criterios de búsqueda</td></tr>
              ) : (
                juecesFiltrados.map(j => (
                  <tr key={j.idJuez}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 fw-bold shadow-sm" style={{width: '45px', height: '45px', minWidth: '45px', fontSize: '0.9rem'}}>
                          {j.usuario?.nombres?.charAt(0)}{j.usuario?.apellidos?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{j.usuario?.nombres} {j.usuario?.apellidos}</div>
                          <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>ID: {j.idJuez.substring(0,8).toUpperCase()}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column small">
                        <span className="text-dark"><FaEnvelope className="me-1 opacity-50"/> {j.usuario?.dni}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column small">
                        <span className="text-dark"><FaEnvelope className="me-1 opacity-50"/> {j.usuario?.correo}</span>
                        <span className="text-muted"><FaPhone className="me-1 opacity-50"/> {j.usuario?.telefono || "No registrado"}</span>
                      </div>
                    </td>
                    <td><span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 fw-normal"><FaIdCard className="me-1"/> {j.licencia}</span></td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${
                        j.estadoValidacion === "APROBADO" ? "bg-success-subtle text-success border border-success-subtle" :
                        j.estadoValidacion === "RECHAZADO" ? "bg-danger-subtle text-danger border border-danger-subtle" : "bg-warning-subtle text-warning border border-warning-subtle"
                      }`}>
                        {j.estadoValidacion}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <div className="btn-group border rounded-3 overflow-hidden shadow-sm bg-white">
                        {j.estadoValidacion === "PENDIENTE" && (
                          <>
                            <button className="btn btn-sm btn-white text-success border-0 py-2" title="Aprobar" onClick={() => cambiarEstado(j.idJuez, 'aprobar')}><FaCheck /></button>
                            <button className="btn btn-sm btn-white text-danger border-0 py-2" title="Rechazar" onClick={() => cambiarEstado(j.idJuez, 'rechazar')}><FaTimes /></button>
                          </>
                        )}
                        {j.estadoValidacion === "APROBADO" && (
                          <button className="btn btn-sm btn-white text-danger border-0 py-2" title="Inactivar licencia" onClick={() => inactivarLicencia(j.idJuez)}><FaBan /></button>
                        )}
                        <button className="btn btn-sm btn-white text-primary border-0 py-2" title="Editar" onClick={() => abrirEditar(j)}><FaEdit /></button>
                        <button className="btn btn-sm btn-white text-danger border-0 py-2" title="Eliminar" onClick={() => eliminar(j.idJuez)}><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {modal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold">
                  <FaUserTie className="me-2"/>{editingId ? "Actualizar Datos del Juez" : "Registrar Nuevo Juez"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3" >
                  <div className="col-12">
                <label className="form-label fw-bold text-muted small">
                  DNI DEL JUEZ *
                </label>
                <input
                  className="form-control rounded-3 bg-light border-0 py-2"
                  value={form.dni}
                  onChange={e => setForm({ ...form, dni: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                  placeholder="Documento de identidad"
                  inputMode="numeric"
                  maxLength={8}
                />
                 <button
                      className="btn btn-outline-info"
                      onClick={cargarPorDni}
                    >
                      Cargar
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">NOMBRES *</label>
                    <input className="form-control rounded-3 bg-light border-0 py-2" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} placeholder="Ej: Juan Carlos" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">APELLIDOS *</label>
                    <input className="form-control rounded-3 bg-light border-0 py-2" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} placeholder="Ej: Pérez García" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-muted small">CORREO ELECTRÓNICO *</label>
                    <input type="email" className="form-control rounded-3 bg-light border-0 py-2" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} placeholder="usuario@robotech.com" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">TELÉFONO (OPCIONAL)</label>
                    <input
                      type="tel"
                      className="form-control rounded-3 bg-light border-0 py-2"
                      value={form.telefono}
                      onChange={e => setForm({ ...form, telefono: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                      placeholder="987654321"
                      inputMode="numeric"
                      maxLength={9}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small">N° LICENCIA *</label>
                    <input className="form-control rounded-3 bg-light border-0 py-2" value={form.licencia} onChange={e => setForm({ ...form, licencia: e.target.value })} placeholder="J-2026-XYZ" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold text-muted small">
                      CONTRASEÑA {editingId && <span className="fw-normal text-muted">(Dejar vacío si no desea cambiarla)</span>}
                    </label>
                    <input type="password" className="form-control rounded-3 bg-light border-0 py-2" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} placeholder={editingId ? "••••••••" : "Mínimo 6 caracteres"} />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 pb-4 px-4">
                <button className="btn btn-light rounded-pill px-4 fw-bold text-muted" onClick={() => setModal(false)}>CANCELAR</button>
                <button className="btn btn-primary rounded-pill px-4 shadow fw-bold" onClick={guardar}>
                    {editingId ? "GUARDAR CAMBIOS" : "FINALIZAR REGISTRO"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
