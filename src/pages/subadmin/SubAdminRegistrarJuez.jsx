import { useEffect, useState, useCallback, useMemo } from "react";
import { FaUserTie, FaPlus, FaSearch, FaIdCard, FaUser, FaEnvelope, FaTimes, FaTrash, FaEdit, FaLock, FaPhone, FaCheck, FaBan } from "react-icons/fa";
import api from "../../services/axiosConfig";
import { consultarDni } from "../../services/dniService";
import Swal from "sweetalert2";

export default function SubAdminRegistrarJuez() {
  // =========================
  // ESTADOS
  // =========================
  const [busqueda, setBusqueda] = useState("");
  const [jueces, setJueces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    dni: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: "Robot2026*", // ✅ Contraseña temporal por defecto
    licencia: ""
  };

  const [form, setForm] = useState(initialForm);

  // =========================
  // UTILS
  // =========================
  const getAdminId = () => {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return null;
    try {
      const usuario = JSON.parse(usuarioStr);
      return usuario.idUsuario || usuario.id;
    } catch (e) { return null; }
  };

  const adminId = getAdminId();

  // =========================
  // CARGA DE DATOS
  // =========================
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/jueces");
      setJueces(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "No se pudo sincronizar la lista de jueces", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // =========================
  // LÓGICA DNI
  // =========================
  const cargarPorDni = async () => {
    if (form.dni.length !== 8) return Swal.fire("Atención", "DNI debe tener 8 dígitos", "warning");
    try {
      Swal.fire({ title: "Consultando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const data = await consultarDni(form.dni);
      setForm(prev => ({ ...prev, nombres: data.nombres, apellidos: data.apellidos }));
      Swal.close();
    } catch (err) {
      Swal.fire("Error", "No se encontró el DNI", "error");
    }
  };

  // =========================
  // FILTRADO
  // =========================
  const juecesFiltrados = useMemo(() => {
    const term = busqueda.toLowerCase();
    return jueces.filter((j) => 
      (j.usuario?.dni || "").includes(term) ||
      (j.usuario?.nombres?.toLowerCase() || "").includes(term) ||
      (j.licencia?.toLowerCase() || "").includes(term)
    );
  }, [jueces, busqueda]);

  // =========================
  // GESTIÓN DE MODAL
  // =========================
  const abrirModalCrear = () => {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const abrirEditar = (j) => {
    setEditingId(j.idJuez);
    setForm({
      dni: j.usuario?.dni || "",
      nombres: j.usuario?.nombres || "",
      apellidos: j.usuario?.apellidos || "",
      correo: j.usuario?.correo || "",
      telefono: j.usuario?.telefono || "",
      contrasena: "", // Vacío en edición
      licencia: j.licencia || ""
    });
    setModalOpen(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.dni || !form.nombres || !form.licencia) return Swal.fire("Atención", "Campos obligatorios incompletos", "warning");

    try {
      if (!editingId) {
        await api.post("/admin/jueces", { ...form, creadoPor: adminId });
        Swal.fire({ icon: 'success', title: 'Juez Registrado', text: `Clave temporal: ${form.contrasena}`, confirmButtonColor: '#0d6efd' });
      } else {
        const payload = { ...form };
        if (!payload.contrasena.trim()) delete payload.contrasena;
        await api.put(`/admin/jueces/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: 'Datos Actualizados', timer: 1500, showConfirmButton: false });
      }
      setModalOpen(false);
      cargarDatos();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.mensaje || "Error al procesar la solicitud", "error");
    }
  };

  const desactivarJuez = async (idJuez, estadoActual) => {
    const esReactivacion = estadoActual !== 'APROBADO';
    const accion = esReactivacion ? 'aprobar' : 'rechazar';
    
    const result = await Swal.fire({
      title: esReactivacion ? "¿Reactivar Juez?" : "¿Desactivar Juez?",
      text: esReactivacion ? "El juez podrá volver a calificar." : "El juez perderá acceso al sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: esReactivacion ? "#198754" : "#d33",
      confirmButtonText: "Sí, proceder"
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/jueces/${idJuez}/${accion}`, {}, { 
          headers: { "admin-id": adminId } 
        });
        await cargarDatos();
        Swal.fire("Éxito", "Estado actualizado", "success");
      } catch (err) {
        Swal.fire("Error", "No se pudo cambiar el estado", "error");
      }
    }
  };

  return (
    <div className="container-fluid px-4 mt-4 animate__animated animate__fadeIn">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaUserTie className="me-2 text-primary"/>Gestión de Jueces</h2>
          <p className="text-muted mb-0 small text-uppercase fw-bold" style={{letterSpacing: '0.5px'}}>Administración de Autoridades</p>
        </div>
        <button className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold border-0" onClick={abrirModalCrear}>
          <FaPlus className="me-2"/> REGISTRAR JUEZ
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 mb-4 rounded-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted"/></span>
            <input type="text" className="form-control border-0 bg-light shadow-none" placeholder="Buscar por nombre, DNI o licencia..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-secondary small text-uppercase fw-bold">
              <tr>
                <th className="ps-4 py-3">Juez</th>
                <th>Licencia</th>
                <th className="text-center">Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && !modalOpen ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
              ) : (
                juecesFiltrados.map((j) => (
                  <tr key={j.idJuez}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 fw-bold shadow-sm" style={{width: '40px', height: '40px'}}>
                          {j.usuario?.nombres?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{j.usuario?.nombres} {j.usuario?.apellidos}</div>
                          <small className="text-muted">{j.usuario?.dni}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark border fw-normal">{j.licencia}</span></td>
                    <td className="text-center">
                      <span className={`badge rounded-pill px-3 py-2 ${j.estadoValidacion === 'APROBADO' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {j.estadoValidacion}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="btn-group border rounded-3 bg-white shadow-sm overflow-hidden">
                        <button className="btn btn-sm text-primary border-0 py-2" onClick={() => abrirEditar(j)}><FaEdit /></button>
                        <button 
                          className={`btn btn-sm border-0 py-2 ${j.estadoValidacion === 'APROBADO' ? 'text-danger' : 'text-success'}`} 
                          onClick={() => desactivarJuez(j.idJuez, j.estadoValidacion)}
                        >
                          {j.estadoValidacion === 'APROBADO' ? <FaBan title="Desactivar"/> : <FaCheck title="Activar"/>}
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

      {/* MODAL */}
      {modalOpen && (
        <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2050, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="bg-white rounded-4 shadow-lg animate__animated animate__zoomIn" style={{ width: '95%', maxWidth: '650px' }}>
            <div className="modal-header bg-primary text-white border-0 py-3 px-4">
              <h5 className="modal-title fw-bold"><FaUserTie className="me-2"/>{editingId ? "Editar Juez" : "Registrar Nuevo Juez"}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
            </div>
            <form onSubmit={guardar}>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">DNI *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><FaIdCard className="text-muted"/></span>
                      <input className="form-control bg-light border-0 shadow-none" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} placeholder="8 dígitos" />
                      <button type="button" className="btn btn-info text-white fw-bold px-4 shadow-none" onClick={cargarPorDni}>CONSULTAR</button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Nombres *</label>
                    <input className="form-control bg-light border-0 py-2 shadow-none" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Apellidos *</label>
                    <input className="form-control bg-light border-0 py-2 shadow-none" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">N° Licencia *</label>
                    <input className="form-control bg-light border-0 py-2 shadow-none" value={form.licencia} onChange={e => setForm({...form, licencia: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Email *</label>
                    <input type="email" className="form-control bg-light border-0 py-2 shadow-none" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} required />
                  </div>
                  
                  {/* ✅ SECCIÓN DE CONTRASEÑA TEMPORAL MEJORADA */}
                  <div className="col-12 mt-3 pt-3 border-top">
                    <label className="form-label small fw-bold text-primary text-uppercase">Contraseña Temporal *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><FaLock className="text-muted"/></span>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 py-2 shadow-none fw-bold text-primary" 
                        value={form.contrasena} 
                        onChange={e => setForm({...form, contrasena: e.target.value})} 
                        placeholder={editingId ? "••••••••" : "Clave temporal"}
                        required={!editingId}
                      />
                    </div>
                    {!editingId && (
                        <small className="text-muted">Dicta esta contraseña al juez. Podrá cambiarla luego.</small>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pb-4 px-4">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-bold text-muted" onClick={() => setModalOpen(false)}>CANCELAR</button>
                <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow border-0">
                  {editingId ? "GUARDAR CAMBIOS" : "FINALIZAR REGISTRO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .form-control:focus { border-color: #0d6efd !important; }
        .table-hover tbody tr:hover { background-color: #f8faff !important; }
      `}</style>
    </div>
  );
}