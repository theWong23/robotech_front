import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaSearch, FaEdit, FaPowerOff, FaBuilding, FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaLock, FaCheck, FaBan } from "react-icons/fa";
import api from "../../services/axiosConfig";
import { consultarDni } from "../../services/dniService";

export default function Clubes() {
  // =========================
  // ESTADOS
  // =========================
  const [busqueda, setBusqueda] = useState("");
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClubes, setTotalClubes] = useState(0);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [emailSuggestionsField, setEmailSuggestionsField] = useState(null);

  const initialForm = {
    nombre: "", correoContacto: "", telefonoContacto: "", direccionFiscal: "",
    dniPropietario: "", nombresPropietario: "", apellidosPropietario: "",
    correoPropietario: "", telefonoPropietario: "", contrasenaPropietario: ""
  };

  const [form, setForm] = useState(initialForm);

  // =========================
  // UTILS & API
  // =========================
  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const cargarPorDni = async () => {
    if (!form.dniPropietario || form.dniPropietario.length !== 8) {
      return Swal.fire("Atención", "Ingresa un DNI de 8 dígitos", "warning");
    }
    try {
      Swal.fire({ title: "Consultando DNI...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const data = await consultarDni(form.dniPropietario);
      setForm(prev => ({ ...prev, nombresPropietario: data.nombres, apellidosPropietario: data.apellidos }));
      Swal.close();
    } catch (err) { Swal.fire("Error", err.message, "error"); }
  };

  const cargarClubes = useCallback(async (termino = "") => {
    setLoading(true);
    try {
      const res = await api.get("/admin/clubes", {
        params: {
          nombre: termino,
          page: page - 1,
          size: 20
        }
      });
      setClubes(res.data?.content || []);
      setTotalPages(res.data?.totalPages ?? 1);
      setTotalClubes(res.data?.totalElements ?? 0);
    } catch { Swal.fire("Error", "No se pudo cargar la lista", "error"); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => cargarClubes(busqueda), 500);
    return () => clearTimeout(timer);
  }, [busqueda, cargarClubes]);

  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [page, totalPages]);

  const registrarClub = async () => {
    try {
      await api.post("/admin/clubes", form);
      Swal.fire("¡Éxito!", "Club registrado correctamente", "success");
      setModalOpen(false);
      cargarClubes(busqueda);
    } catch (err) {
      // Aquí asumo que usas manejarErrorApi que estaba en tu código original
      const data = err.response?.data;
      Swal.fire("Error", data?.message || "Error al registrar", "error");
    }
  };

  // =========================
  // LÓGICA EDITAR Y ESTADO
  // =========================
  const abrirEditar = (club) => {
    setEditando({
      ...club,
      // Mapeo defensivo para asegurar que los datos del propietario se carguen
      dniPropietario: club.dniPropietario || "",
      nombresPropietario: club.nombresPropietario || "",
      apellidosPropietario: club.apellidosPropietario || "",
      telefonoPropietario: club.telefonoPropietario || ""
    });
  };

  const guardarEdicion = async () => {
    try {
      // Enviamos el objeto editando asegurándonos que el estado no sea null
      await api.put(`/admin/clubes/${editando.idClub}`, editando);
      Swal.fire("Actualizado", "Datos del club modificados", "success");
      setEditando(null);
      cargarClubes(busqueda);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.mensaje || "Error al actualizar", "error");
    }
  };

  const cambiarEstado = async (club) => {
    const esActivacion = club.estado !== "ACTIVO";
    const nuevoEstado = esActivacion ? "ACTIVO" : "INACTIVO";

    const result = await Swal.fire({
      title: `¿${esActivacion ? 'Activar' : 'Desactivar'} club?`,
      text: `El club pasará a estado ${nuevoEstado}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      confirmButtonColor: esActivacion ? "#198754" : "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      // Para cambiar estado, enviamos el objeto club con el estado invertido
      // y nos aseguramos de que no falten datos obligatorios
      await api.put(`/admin/clubes/${club.idClub}`, { 
        ...club, 
        estado: nuevoEstado 
      });
      Swal.fire("Estado actualizado", `El club ahora está ${nuevoEstado}`, "success");
      cargarClubes(busqueda);
    } catch (err) {
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }
  };

  // =========================
  // UI COMPONENTS
  // =========================
  const EmailSuggestions = ({ fieldName }) => {
    if (emailSuggestionsField !== fieldName || !emailSuggestions.length) return null;
    return (
      <div className="mt-1 mb-2">
        <small className="text-muted d-block mb-1">Sugerencias disponibles:</small>
        <div className="d-flex flex-wrap gap-2">
          {emailSuggestions.map(s => (
            <span key={s} className="badge bg-light text-primary border" style={{cursor: "pointer"}} onClick={() => { setField(fieldName, s); setEmailSuggestions([]); }}>{s}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid px-4 mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaBuilding className="me-2"/>Gestión de Clubes</h2>
          <p className="text-muted mb-0">Administra las entidades y sus propietarios.</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => { setForm(initialForm); setModalOpen(true); }}>
          <FaPlus className="me-2"/> Registrar Club
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-light border-0"><FaSearch className="text-muted"/></span>
            <input type="text" className="form-control border-0 bg-light" placeholder="Buscar club por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Nombre del Club</th>
                  <th>Contacto</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
                ) : clubes.length === 0 ? (
                  <tr><td colSpan="5" className="text-center text-muted py-5">No se encontraron clubes registrados.</td></tr>
                ) : (
                  clubes.map((c) => (
                    <tr key={c.idClub}>
                      <td className="ps-4 fw-bold text-primary">{c.nombre}</td>
                      <td>
                        <div className="d-flex flex-column small">
                          <span className="text-muted"><FaEnvelope className="me-1"/>{c.correoContacto}</span>
                          <span className="text-muted"><FaPhone className="me-1"/>{c.telefonoContacto}</span>
                        </div>
                      </td>
                      <td><small className="text-muted"><FaMapMarkerAlt className="me-1 text-danger"/>{c.direccionFiscal || "—"}</small></td>
                      <td>
                        <span className={`badge rounded-pill ${c.estado === "ACTIVO" ? "bg-success" : "bg-danger"}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => abrirEditar(c)} title="Editar Info"><FaEdit /></button>
                        <button className={`btn btn-sm ${c.estado === "ACTIVO" ? "btn-outline-danger" : "btn-outline-success"}`} onClick={() => cambiarEstado(c)} title={c.estado === "ACTIVO" ? "Desactivar" : "Activar"}><FaPowerOff /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!loading && totalClubes > 0 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div className="text-muted small">
            Mostrando {clubes.length} de {totalClubes} clubes
          </div>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(1)} disabled={page <= 1}>Primero</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</button>
            <span className="btn btn-light btn-sm disabled">Página {page} de {totalPages}</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Siguiente</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Último</button>
          </div>
        </div>
      )}

      {/* MODAL CREAR */}
      {modalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold"><FaBuilding className="me-2"/>Nuevo Club</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <h6 className="fw-bold text-primary mb-3">Datos del Club</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-12"><label className="form-label small text-muted fw-bold">Nombre del Club</label><input className="form-control" value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Correo Contacto</label><input className="form-control" value={form.correoContacto} onChange={(e) => setField("correoContacto", e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Teléfono Contacto</label><input className="form-control" value={form.telefonoContacto} onChange={(e) => setField("telefonoContacto", e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="numeric" maxLength={9} /></div>
                    <div className="col-12"><label className="form-label small text-muted fw-bold">Dirección Fiscal</label><input className="form-control" value={form.direccionFiscal} onChange={(e) => setField("direccionFiscal", e.target.value)} /></div>
                  </div>
                  <hr className="text-muted"/>
                  <h6 className="fw-bold text-success mb-3"><FaUserTie className="me-2"/>Datos del Propietario</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">DNI del Propietario</label>
                      <div className="input-group">
                        <input className="form-control" value={form.dniPropietario} onChange={(e) => setField("dniPropietario", e.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" maxLength={8} />
                        <button className="btn btn-outline-info" onClick={cargarPorDni}>Cargar</button>
                      </div>
                    </div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Nombres</label><input className="form-control" value={form.nombresPropietario} readOnly /></div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Apellidos</label><input className="form-control" value={form.apellidosPropietario} readOnly /></div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Correo Propietario</label><input className="form-control" value={form.correoPropietario} onChange={(e) => setField("correoPropietario", e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Teléfono Propietario</label><input className="form-control" value={form.telefonoPropietario} onChange={(e) => setField("telefonoPropietario", e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="numeric" maxLength={9} /></div>
                    <div className="col-12"><label className="form-label small text-muted fw-bold">Contraseña Inicial</label><input type="password" className="form-control" value={form.contrasenaPropietario} onChange={(e) => setField("contrasenaPropietario", e.target.value)} /></div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                  <button className="btn btn-success px-4" onClick={registrarClub}>Registrar Club</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL EDITAR */}
      {editando && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold"><FaEdit className="me-2"/>Editar Club</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditando(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <h6 className="fw-bold text-primary mb-3">Datos del Club</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted">Nombre del Club</label>
                      <input className="form-control" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Correo Contacto</label>
                      <input className="form-control" value={editando.correoContacto} onChange={(e) => setEditando({ ...editando, correoContacto: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">Teléfono Contacto</label>
                      <input className="form-control" value={editando.telefonoContacto} onChange={(e) => setEditando({ ...editando, telefonoContacto: e.target.value.replace(/\D/g, "").slice(0, 9) })} inputMode="numeric" maxLength={9} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted">Dirección Fiscal</label>
                      <input className="form-control" value={editando.direccionFiscal} onChange={(e) => setEditando({ ...editando, direccionFiscal: e.target.value })} />
                    </div>
                  </div>
                  <hr className="text-muted"/>
                  <h6 className="fw-bold text-success mb-3"><FaUserTie className="me-2"/>Datos del Propietario</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">DNI del Propietario</label>
                      <input className="form-control" value={editando.dniPropietario} onChange={(e) => setEditando({ ...editando, dniPropietario: e.target.value.replace(/\D/g, "").slice(0, 8) })} inputMode="numeric" maxLength={8} />
                    </div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Nombres</label><input className="form-control" value={editando.nombresPropietario} onChange={(e) => setEditando({ ...editando, nombresPropietario: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Apellidos</label><input className="form-control" value={editando.apellidosPropietario} onChange={(e) => setEditando({ ...editando, apellidosPropietario: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small text-muted fw-bold">Teléfono Propietario</label><input className="form-control" value={editando.telefonoPropietario} onChange={(e) => setEditando({ ...editando, telefonoPropietario: e.target.value.replace(/\D/g, "").slice(0, 9) })} inputMode="numeric" maxLength={9} /></div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button className="btn btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
                  <button className="btn btn-primary px-4" onClick={guardarEdicion}>Guardar Cambios</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
