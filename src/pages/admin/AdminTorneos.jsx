import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaTrophy, FaCalendarAlt, FaEdit, FaTrash, FaListUl, FaSearch, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import api from "../../services/axiosConfig"; // Ensure this points to your configured axios instance

export default function AdminTorneos() {
  const navigate = useNavigate();

  // =============================
  // ESTADOS
  // =============================
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  // Modal & Edición
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    fechaAperturaInscripcion: "",
    fechaCierreInscripcion: "",
    estado: "BORRADOR",
  });

  // =============================
  // HELPER: VISUALIZACIÓN DE FECHAS
  // =============================
  // Mantenemos esto en el frontend porque es lógica de visualización (Timezones)
  const formatFechaUTC = (fechaString) => {
    if (!fechaString) return "—";
    return new Date(fechaString).toLocaleDateString('es-PE', { timeZone: 'UTC' });
  };

  const getStatusBadge = (estado) => {
    const map = {
      BORRADOR: "bg-secondary",
      INSCRIPCIONES_ABIERTAS: "bg-primary",
      INSCRIPCIONES_CERRADAS: "bg-warning text-dark",
      EN_PROGRESO: "bg-success",
      FINALIZADO: "bg-dark"
    };
    return map[estado] || "bg-light text-dark";
  };

  // =============================
  // CARGAR DATOS
  // =============================
  const cargar = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/torneos");
      setTorneos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // =============================
  // FILTRADO (VISUAL)
  // =============================
  const torneosFiltrados = useMemo(() => {
    return torneos.filter(t => 
      t.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [torneos, busqueda]);

  // =============================
  // ACCIONES (LOGIC DELEGATED TO BACKEND)
  // =============================
  const guardar = async () => {
    // 1. Validación Mínima de UI
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) {
      return Swal.fire("Atención", "Nombre y fechas del evento son obligatorios", "warning");
    }

    try {
      // 2. Enviar al Backend
      if (!editingId) {
        await api.post("/admin/torneos", form);
        Swal.fire({ icon: 'success', title: 'Creado', text: 'Torneo registrado con éxito', timer: 1500, showConfirmButton: false });
      } else {
        await api.put(`/admin/torneos/${editingId}`, form);
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Torneo modificado con éxito', timer: 1500, showConfirmButton: false });
      }
      
      setModal(false);
      cargar(); // Recargar lista
    } catch (err) {
      // 3. Manejo de Errores del Backend (Ej: Fechas inválidas, Nombre duplicado)
      const msg = err.response?.data?.mensaje || "No se pudo guardar el torneo";
      Swal.fire("Error", msg, "error");
    }
  };

  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar torneo?",
      text: "El backend verificará si se puede eliminar o si debe archivarse.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, proceder"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/torneos/${id}`);
        Swal.fire("Procesado", "Acción realizada correctamente.", "success");
        cargar();
      } catch (err) {
        const msg = err.response?.data?.mensaje || "No se pudo eliminar el torneo";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const cambiarEstado = async (idTorneo, nuevoEstado) => {
    try {
      // El backend validará si la transición de estado es legal (Ej: No pasar de BORRADOR a FINALIZADO directo)
      await api.put(`/admin/torneos/${idTorneo}/estado`, { estado: nuevoEstado });
      
      // Actualización optimista de la UI
      setTorneos(prev => prev.map(t => t.idTorneo === idTorneo ? { ...t, estado: nuevoEstado } : t));
      
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      Toast.fire({ icon: 'success', title: 'Estado actualizado' });
    } catch (err) {
      const msg = err.response?.data?.mensaje || "No se pudo cambiar el estado";
      Swal.fire("Error", msg, "error");
      cargar(); // Revertir cambios visuales si falló
    }
  };

  // =============================
  // MODAL HANDLERS
  // =============================
  const abrirCrear = () => {
    setForm({
      nombre: "", descripcion: "", estado: "BORRADOR",
      fechaInicio: "", fechaFin: "",
      fechaAperturaInscripcion: "", fechaCierreInscripcion: ""
    });
    setEditingId(null);
    setModal(true);
  };

  const abrirEditar = (t) => {
    setEditingId(t.idTorneo);
    setForm({
      nombre: t.nombre,
      descripcion: t.descripcion || "",
      fechaInicio: t.fechaInicio, // Backend debe enviar formato ISO compatible con datetime-local
      fechaFin: t.fechaFin,
      fechaAperturaInscripcion: t.fechaAperturaInscripcion,
      fechaCierreInscripcion: t.fechaCierreInscripcion,
      estado: t.estado
    });
    setModal(true);
  };

  // =============================
  // RENDER UI (Mantenido Idéntico)
  // =============================
  return (
    <div className="container-fluid">
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaTrophy className="me-2 text-warning" />
            Gestión de Torneos
          </h2>
          <p className="text-muted mb-0">Administra las competencias y sus fechas.</p>
        </div>
        <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2" onClick={abrirCrear}>
          <FaPlus /> Nuevo Torneo
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-0"><FaSearch className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control border-0" 
              placeholder="Buscar torneo por nombre..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Torneo</th>
                  <th>Fechas Evento</th>
                  <th>Inscripciones</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
                ) : torneosFiltrados.length === 0 ? (
                   <tr><td colSpan="5" className="text-center py-5 text-muted">No se encontraron torneos.</td></tr>
                ) : (
                  torneosFiltrados.map(t => (
                    <tr key={t.idTorneo}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{t.nombre}</div>
                        <small className="text-muted text-truncate d-block" style={{maxWidth: '200px'}}>
                          {t.descripcion || "Sin descripción"}
                        </small>
                      </td>
                      
                      <td>
                        <div className="small">
                          <div className="d-flex align-items-center mb-1">
                            <span className="badge bg-light text-secondary border me-2">INICIO</span>
                            {formatFechaUTC(t.fechaInicio)}
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="badge bg-light text-secondary border me-2">FIN</span>
                            {formatFechaUTC(t.fechaFin)}
                          </div>
                        </div>
                      </td>

                      <td>
                        <small className="text-muted">
                          {formatFechaUTC(t.fechaAperturaInscripcion)} <br/>
                           al {formatFechaUTC(t.fechaCierreInscripcion)}
                        </small>
                      </td>

                      <td>
                        <select 
                          className={`form-select form-select-sm border-0 fw-bold text-white ${getStatusBadge(t.estado)}`}
                          style={{width: '140px', cursor: 'pointer', backgroundImage: 'none', textAlign: 'center'}}
                          value={t.estado}
                          disabled={t.estado === "FINALIZADO"}
                          onChange={e => cambiarEstado(t.idTorneo, e.target.value)}
                        >
                          <option className="bg-white text-dark" value="BORRADOR">Borrador</option>
                          <option className="bg-white text-dark" value="INSCRIPCIONES_ABIERTAS">Abierto</option>
                          <option className="bg-white text-dark" value="INSCRIPCIONES_CERRADAS">Cerrado</option>
                          <option className="bg-white text-dark" value="EN_PROGRESO">En Progreso</option>
                          <option className="bg-white text-dark" value="FINALIZADO">Finalizado</option>
                        </select>
                      </td>

                      <td className="text-center">
                        <div className="btn-group">
                          <button 
                            className="btn btn-outline-secondary btn-sm" 
                            title="Gestionar Categorías"
                            onClick={() => navigate(`/admin/torneos/${t.idTorneo}/categorias`)}
                          >
                            <FaListUl />
                          </button>
                          <button 
                            className="btn btn-outline-primary btn-sm" 
                            title="Editar Info"
                            onClick={() => abrirEditar(t)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm" 
                            title="Eliminar"
                            onClick={() => eliminar(t.idTorneo)}
                          >
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

      {/* ================= MODAL ================= */}
      {modal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  {editingId ? <><FaEdit className="me-2"/>Editar Torneo</> : <><FaTrophy className="me-2"/>Crear Torneo</>}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
              </div>
              
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">Información Básica</label>
                  <input 
                    className="form-control mb-2" 
                    placeholder="Nombre del Torneo"
                    value={form.nombre} 
                    onChange={e => setForm({ ...form, nombre: e.target.value })} 
                  />
                  <textarea 
                    className="form-control" 
                    placeholder="Descripción breve..."
                    rows="2"
                    value={form.descripcion} 
                    onChange={e => setForm({ ...form, descripcion: e.target.value })} 
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-primary"><FaCalendarAlt className="me-1"/> Evento</label>
                    <div className="input-group mb-2">
                      <span className="input-group-text bg-light">Inicio</span>
                      <input type="datetime-local" className="form-control" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light">Fin&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <input type="datetime-local" className="form-control" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-success"><FaEdit className="me-1"/> Inscripciones</label>
                    <div className="input-group mb-2">
                      <span className="input-group-text bg-light">Apertura</span>
                      <input type="datetime-local" className="form-control" value={form.fechaAperturaInscripcion} onChange={e => setForm({ ...form, fechaAperturaInscripcion: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light">Cierre&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <input type="datetime-local" className="form-control" value={form.fechaCierreInscripcion} onChange={e => setForm({ ...form, fechaCierreInscripcion: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-bold small text-muted">Estado Inicial</label>
                  <select className="form-select" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                    <option value="BORRADOR">BORRADOR (No visible al público)</option>
                    <option value="INSCRIPCIONES_ABIERTAS">INSCRIPCIONES ABIERTAS</option>
                    <option value="INSCRIPCIONES_CERRADAS">INSCRIPCIONES CERRADAS</option>
                    <option value="EN_PROGRESO">EN PROGRESO</option>
                    <option value="FINALIZADO">FINALIZADO</option>
                  </select>
                  <small className="text-muted">Si seleccionas Borrador, el torneo no aparecerá en la web pública.</small>
                </div>
              </div>

              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>
                  <FaTimes className="me-1"/> Cancelar
                </button>
                <button className="btn btn-primary px-4" onClick={guardar}>
                  <FaSave className="me-1"/> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}