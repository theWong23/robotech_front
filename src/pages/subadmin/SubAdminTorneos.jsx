import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaTrophy, FaCalendarAlt, FaEdit, FaTrash, FaListUl, FaSearch, FaPlus, FaSave, FaUserPlus, FaClock } from "react-icons/fa";
import api from "../../services/axiosConfig";

export default function SubAdminTorneos() {
  const navigate = useNavigate();

  // =============================
  // ESTADOS
  // =============================
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    fechaAperturaInscripcion: "",
    fechaCierreInscripcion: "",
    estado: "BORRADOR",
  };

  const [form, setForm] = useState(initialForm);

  // =============================
  // HELPERS DE FORMATEO
  // =============================
  const formatFechaTabla = (str) => {
    if (!str) return "—";
    const s = str.split(/[-T :]/); 
    if (s.length < 3) return str;
    return `${s[2]}/${s[1]}/${s[0]}`;
  };

  const formatParaInputDate = (str) => {
    if (!str) return "";
    const s = str.split(/[-T :]/);
    if (s.length < 3) return "";
    const pad = (n) => n.toString().padStart(2, '0');
    return `${s[0]}-${pad(s[1])}-${pad(s[2])}`;
  };

  const getStatusBadge = (estado) => {
    const map = {
      BORRADOR: "bg-secondary-subtle text-secondary border-secondary",
      INSCRIPCIONES_ABIERTAS: "bg-primary-subtle text-primary border-primary",
      INSCRIPCIONES_CERRADAS: "bg-warning-subtle text-warning border-warning",
      EN_PROGRESO: "bg-success-subtle text-success border-success",
      FINALIZADO: "bg-dark-subtle text-dark border-dark"
    };
    return map[estado] || "bg-light text-dark border";
  };

  // =============================
  // CARGAR DATOS
  // =============================
  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/torneos");
      setTorneos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const torneosFiltrados = useMemo(() => 
    torneos.filter(t => (t.nombre || "").toLowerCase().includes(busqueda.toLowerCase()))
  , [torneos, busqueda]);

  // =============================
  // ACCIONES
  // =============================
  const abrirEditar = (t) => {
    if (t.estado === "FINALIZADO") {
      return Swal.fire("Atención", "No se puede editar un torneo finalizado", "info");
    }
    setEditingId(t.idTorneo);
    setForm({
      nombre: t.nombre || "",
      descripcion: t.descripcion || "",
      estado: t.estado || "BORRADOR",
      fechaInicio: formatParaInputDate(t.fechaInicio),
      fechaFin: formatParaInputDate(t.fechaFin),
      fechaAperturaInscripcion: formatParaInputDate(t.fechaAperturaInscripcion),
      fechaCierreInscripcion: formatParaInputDate(t.fechaCierreInscripcion),
    });
    setModal(true);
  };

  const guardar = async (e) => {
    if (e) e.preventDefault();
    const dataAEnviar = {
      ...form,
      fechaInicio: form.fechaInicio ? `${form.fechaInicio}T00:00:00` : null,
      fechaFin: form.fechaFin ? `${form.fechaFin}T23:59:59` : null,
      fechaAperturaInscripcion: form.fechaAperturaInscripcion ? `${form.fechaAperturaInscripcion}T00:00:00` : null,
      fechaCierreInscripcion: form.fechaCierreInscripcion ? `${form.fechaCierreInscripcion}T23:59:59` : null,
    };

    try {
      if (!editingId) await api.post("/admin/torneos", dataAEnviar);
      else await api.put(`/admin/torneos/${editingId}`, dataAEnviar);
      
      Swal.fire({ icon: 'success', title: 'Éxito', timer: 1500, showConfirmButton: false });
      setModal(false);
      cargar();
    } catch (err) { Swal.fire("Error", "No se pudo guardar", "error"); }
  };

  const cambiarEstado = async (id, tActual, nuevoEstado) => {
    if (tActual.estado === "FINALIZADO") {
      Swal.fire("Acción bloqueada", "El torneo ya ha sido finalizado", "error");
      cargar(); // Reset select visual
      return;
    }

    if (nuevoEstado === "FINALIZADO") {
      const res = await Swal.fire({
        title: "¿Finalizar torneo?",
        text: "Una vez finalizado no se podrá editar ni cambiar su estado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, finalizar"
      });
      if (!res.isConfirmed) { cargar(); return; }
    }

    try {
      await api.put(`/admin/torneos/${id}/estado`, { estado: nuevoEstado });
      setTorneos(prev => prev.map(t => t.idTorneo === id ? { ...t, estado: nuevoEstado } : t));
      Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1000, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
      cargar();
    }
  };

  const eliminar = async (id, tActual) => {
    if (tActual.estado === "FINALIZADO") {
        return Swal.fire("No permitido", "No puedes eliminar un torneo finalizado", "warning");
    }
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar?", text: "Esta acción es permanente", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Sí, eliminar"
    });
    if (isConfirmed) {
      try {
        await api.delete(`/admin/torneos/${id}`);
        cargar();
        Swal.fire("Eliminado", "Torneo borrado", "success");
      } catch (err) { Swal.fire("Error", "No se pudo eliminar", "error"); }
    }
  };

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn text-dark">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
        <div>
          <h2 className="fw-bold mb-0 text-dark"><FaTrophy className="me-2 text-warning"/>Torneos</h2>
          <p className="text-muted mb-0 small fw-bold text-uppercase ls-1">Gestión Administrativa</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm border-0" onClick={() => { setEditingId(null); setForm(initialForm); setModal(true); }}>
          <FaPlus className="me-2"/> NUEVO TORNEO
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted"/></span>
            <input type="text" className="form-control border-0 bg-light shadow-none" placeholder="Buscar torneo..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-secondary small text-uppercase fw-bold">
              <tr>
                <th className="ps-4 py-3">Nombre</th>
                <th>Cronograma</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
              ) : torneosFiltrados.map(t => (
                <tr key={t.idTorneo}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark">{t.nombre}</div>
                    <small className="text-muted d-block text-truncate" style={{maxWidth:'250px'}}>{t.descripcion || "Sin descripción"}</small>
                  </td>
                  <td>
                    <div className="mb-1 small">
                      <span className="text-primary fw-bold"><FaCalendarAlt className="me-1"/>EVENTO:</span> {formatFechaTabla(t.fechaInicio)} - {formatFechaTabla(t.fechaFin)}
                    </div>
                    <div className="small">
                      <span className="text-success fw-bold"><FaUserPlus className="me-1"/>INSC:</span> {formatFechaTabla(t.fechaAperturaInscripcion)} - {formatFechaTabla(t.fechaCierreInscripcion)}
                    </div>
                  </td>
                  <td>
                    <select 
                      className={`form-select form-select-sm border fw-bold rounded-pill px-3 ${getStatusBadge(t.estado)}`}
                      style={{width: '180px', cursor: 'pointer'}}
                      value={t.estado}
                      disabled={t.estado === "FINALIZADO"}
                      onChange={e => cambiarEstado(t.idTorneo, t, e.target.value)}
                    >
                      <option value="BORRADOR">BORRADOR</option>
                      <option value="INSCRIPCIONES_ABIERTAS">ABIERTAS</option>
                      <option value="INSCRIPCIONES_CERRADAS">CERRADAS</option>
                      <option value="EN_PROGRESO">EN PROGRESO</option>
                      <option value="FINALIZADO">FINALIZADO</option>
                    </select>
                  </td>
                  <td className="text-end pe-4">
                    <div className="btn-group border rounded-3 overflow-hidden bg-white shadow-sm">
                      <button className="btn btn-sm text-secondary border-0 py-2" onClick={() => navigate(`/admin/torneos/${t.idTorneo}/categorias`)} title="Categorías"><FaListUl /></button>
                      <button className="btn btn-sm text-primary border-0 py-2" disabled={t.estado === "FINALIZADO"} onClick={() => abrirEditar(t)} title="Editar"><FaEdit /></button>
                      <button className="btn btn-sm text-danger border-0 py-2" disabled={t.estado === "FINALIZADO"} onClick={() => eliminar(t.idTorneo, t)} title="Eliminar"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (RESTABLECIDO) */}
      {modal && (
        <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2050, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="bg-white rounded-4 shadow-lg animate__animated animate__zoomIn" style={{ width: '95%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-4 border-bottom bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="fw-bold mb-0">{editingId ? <><FaEdit className="me-2"/>Editar Torneo</> : <><FaPlus className="me-2"/>Nuevo Torneo</>}</h4>
              <button className="btn-close btn-close-white shadow-none" onClick={() => setModal(false)}></button>
            </div>
            
            <form onSubmit={guardar} className="p-4">
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Nombre del Torneo *</label>
                  <input className="form-control bg-light border-0 py-2 shadow-none" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
                </div>
                
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Descripción</label>
                  <textarea className="form-control bg-light border-0 shadow-none" rows="2" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
                </div>

                <div className="col-md-6 border-end">
                  <h6 className="fw-bold text-primary mb-3 small text-uppercase ls-1"><FaCalendarAlt className="me-2"/>Cronograma Evento</h6>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Fecha Inicio *</label>
                    <input type="date" className="form-control bg-light border-0" value={form.fechaInicio} onChange={e => setForm({...form, fechaInicio: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Fecha Fin *</label>
                    <input type="date" className="form-control bg-light border-0" value={form.fechaFin} onChange={e => setForm({...form, fechaFin: e.target.value})} required />
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="fw-bold text-success mb-3 small text-uppercase ls-1"><FaUserPlus className="me-2"/>Inscripciones</h6>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Apertura</label>
                    <input type="date" className="form-control bg-light border-0" value={form.fechaAperturaInscripcion} onChange={e => setForm({...form, fechaAperturaInscripcion: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Cierre</label>
                    <input type="date" className="form-control bg-light border-0" value={form.fechaCierreInscripcion} onChange={e => setForm({...form, fechaCierreInscripcion: e.target.value})} />
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Estado</label>
                  <select className="form-select bg-light border-0 py-2" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                    <option value="BORRADOR">BORRADOR</option>
                    <option value="INSCRIPCIONES_ABIERTAS">INSCRIPCIONES ABIERTAS</option>
                    <option value="INSCRIPCIONES_CERRADAS">INSCRIPCIONES CERRADAS</option>
                    <option value="EN_PROGRESO">EN PROGRESO</option>
                    <option value="FINALIZADO">FINALIZADO</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top text-end">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-bold me-2" onClick={() => setModal(false)}>CANCELAR</button>
                <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-sm border-0">
                  <FaSave className="me-2"/> GUARDAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .ls-1 { letter-spacing: 0.5px; }
        .form-control:focus, .form-select:focus { border-color: #0d6efd !important; }
        .bg-primary-subtle { background-color: #e7f1ff !important; }
        .bg-success-subtle { background-color: #d1e7dd !important; }
        .bg-warning-subtle { background-color: #fff3cd !important; }
        .bg-secondary-subtle { background-color: #f8f9fa !important; }
        .bg-dark-subtle { background-color: #ced4da !important; }
      `}</style>
    </div>
  );
}