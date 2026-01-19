import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaSearch, FaEdit, FaPowerOff, FaBuilding, FaUserTie, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import api from "../../services/axiosConfig";
import { consultarDni } from "../../services/dniService";

export default function Clubes() {
  // =========================
  // ESTADOS
  // =========================
  const [busqueda, setBusqueda] = useState("");
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  // Suggestions (UX feature recibida del backend)
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [emailSuggestionsField, setEmailSuggestionsField] = useState(null);

  const initialForm = {
    nombre: "",
    correoContacto: "",
    telefonoContacto: "",
    direccionFiscal: "",
    dniPropietario: "",
    nombresPropietario: "",
    apellidosPropietario: "",
    correoPropietario: "",
    telefonoPropietario: "",
    contrasenaPropietario: ""
  };

  const [form, setForm] = useState(initialForm);

  // =========================
  // UTILS
  // =========================
  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  // =========================
  // API ERROR HANDLING
  // =========================
  const manejarErrorApi = async (err) => {
    const data = err.response?.data;

    if (typeof data === "string") {
      return Swal.fire("Error", data, "error");
    }

    // Caso: Correo ya existe con sugerencias (Lógica de negocio del backend)
    if (data?.code === "EMAIL_TAKEN") {
      const field = data?.fieldErrors?.field; 
      setEmailSuggestionsField(field);
      setEmailSuggestions(data.suggestions || []);
      return Swal.fire("Correo en uso", data.message, "warning");
    }

    // Caso: Errores de validación de campos (JSR-303/Jakarta Bean Validation)
    const fieldErrors = data?.fieldErrors;
    if (fieldErrors && typeof fieldErrors === "object" && !data.code) {
      const mensajes = Object.entries(fieldErrors)
        .map(([campo, msg]) => `• <b>${campo}</b>: ${msg}`)
        .join("<br/>");
      return Swal.fire({ icon: "error", title: "Datos inválidos", html: mensajes });
    }

    // Fallback genérico
    Swal.fire("Error", data?.message || "Ocurrió un error inesperado", "error");
  };

  const cargarPorDni = async () => {
  if (!form.dniPropietario || form.dniPropietario.length !== 8) {
    return Swal.fire("DNI inválido", "Ingresa un DNI válido de 8 dígitos", "warning");
  }

  try {
    Swal.fire({
      title: "Consultando DNI...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const data = await consultarDni(form.dniPropietario);

    setForm(prev => ({
      ...prev,
      nombresPropietario: data.nombres,
      apellidosPropietario: data.apellidos
    }));

    Swal.close();
  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
};
  // =========================
  // CARGA DE DATOS
  // =========================
  const cargarClubes = useCallback(async (termino = "") => {
    setLoading(true);
    try {
      // El backend se encarga de filtrar por nombre si le llega el parametro
      const res = await api.get("/admin/clubes", { params: { nombre: termino } });
      setClubes(res.data || []);
    } catch {
      Swal.fire("Error", "No se pudo cargar la lista de clubes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarClubes(busqueda);
    }, 500);
    return () => clearTimeout(timer);
  }, [busqueda, cargarClubes]);

  // =========================
  // LOGICA CREAR (Cliente Ligero)
  // =========================
  const abrirModalCrear = () => {
    setEmailSuggestions([]);
    setForm(initialForm);
    setModalOpen(true);
  };

  const crearClub = async () => {
    // Validación mínima: Solo chequear campos vacíos
    const required = [
      "nombre", "correoContacto", "telefonoContacto", 
      "nombresPropietario", "apellidosPropietario", "correoPropietario", 
      "telefonoPropietario", "contrasenaPropietario"
    ];

    const vacios = required.filter(k => !form[k]?.trim());
    if (vacios.length > 0) {
        return Swal.fire("Campos incompletos", "Por favor completa todos los campos obligatorios.", "warning");
    }

    // El backend validará formatos de email, unicidad, longitudes, etc.
    try {
      await api.post("/admin/clubes", form);
      Swal.fire("Éxito", "Club registrado correctamente", "success");
      setModalOpen(false);
      cargarClubes(busqueda);
    } catch (err) {
      manejarErrorApi(err);
    }
  };

  // =========================
  // LOGICA EDITAR / ESTADO
  // =========================
  const guardarEdicion = async () => {
    try {
      await api.put(`/admin/clubes/${editando.idClub}`, editando);
      Swal.fire("Actualizado", "Datos del club modificados", "success");
      setEditando(null);
      cargarClubes(busqueda);
    } catch (err) {
      manejarErrorApi(err);
    }
  };

  const cambiarEstado = async (club) => {
    // El backend decide si la transición de estado es válida
    const nuevoEstado = club.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const accion = nuevoEstado === "ACTIVO" ? "Activar" : "Desactivar";

    const result = await Swal.fire({
      title: `¿${accion} club?`,
      text: `El club pasará a estado ${nuevoEstado}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/clubes/${club.idClub}`, { ...club, estado: nuevoEstado });
      Swal.fire("Estado actualizado", "", "success");
      cargarClubes(busqueda);
    } catch (err) {
      manejarErrorApi(err);
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
            <span 
              key={s} 
              className="badge bg-light text-primary border" 
              style={{cursor: "pointer"}}
              onClick={() => {
                setField(fieldName, s);
                setEmailSuggestions([]);
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="container-fluid px-4 mt-4">
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaBuilding className="me-2"/>Gestión de Clubes</h2>
          <p className="text-muted mb-0">Administra las entidades y sus propietarios.</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={abrirModalCrear}>
          <FaPlus className="me-2"/> Registrar Club
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-light border-0"><FaSearch className="text-muted"/></span>
            <input
              type="text"
              className="form-control border-0 bg-light"
              placeholder="Buscar club por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
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
                      <td>
                        <small className="text-muted"><FaMapMarkerAlt className="me-1 text-danger"/>{c.direccionFiscal || "—"}</small>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${c.estado === "ACTIVO" ? "bg-success" : "bg-danger"}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-outline-primary btn-sm me-2" 
                          onClick={() => setEditando({ ...c })}
                          title="Editar Info"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`btn btn-sm ${c.estado === "ACTIVO" ? "btn-outline-danger" : "btn-outline-success"}`}
                          onClick={() => cambiarEstado(c)}
                          title={c.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                        >
                          <FaPowerOff />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-top-0 py-3">
            <small className="text-muted">Mostrando {clubes.length} registros</small>
        </div>
      </div>

      {/* ================= MODAL CREAR ================= */}
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
                  
                  {/* SECCIÓN CLUB */}
                  <h6 className="fw-bold text-primary mb-3">Datos del Club</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <label className="form-label small text-muted fw-bold">Nombre del Club</label>
                      <input className="form-control" value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">Correo Contacto</label>
                      <input className="form-control" value={form.correoContacto} onChange={(e) => setField("correoContacto", e.target.value)} />
                      <EmailSuggestions fieldName="correoContacto" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">Teléfono Contacto</label>
                      <input className="form-control" value={form.telefonoContacto} onChange={(e) => setField("telefonoContacto", e.target.value)} placeholder="Ej: 999888777" />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted fw-bold">Dirección Fiscal</label>
                      <input className="form-control" value={form.direccionFiscal} onChange={(e) => setField("direccionFiscal", e.target.value)} />
                    </div>
                  </div>

                  <hr className="text-muted"/>

                  {/* SECCIÓN PROPIETARIO */}
                  <h6 className="fw-bold text-success mb-3"><FaUserTie className="me-2"/>Datos del Propietario</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">DNI del Propietario</label>
                      <input
                        className="form-control"
                        value={form.dniPropietario}
                        onChange={(e) => setField("dniPropietario", e.target.value)}
                        placeholder="Documento de identidad"
                      />
                       <button
                          className="btn btn-outline-info"
                          onClick={cargarPorDni}
                        >
                          Cargar
                        </button>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">Nombres</label>
                      <input className="form-control" value={form.nombresPropietario} onChange={(e) => setField("nombresPropietario", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">Apellidos</label>
                      <input className="form-control" value={form.apellidosPropietario} onChange={(e) => setField("apellidosPropietario", e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">Correo Propietario</label>
                      <input className="form-control" value={form.correoPropietario} onChange={(e) => setField("correoPropietario", e.target.value)} />
                      <EmailSuggestions fieldName="correoPropietario" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted fw-bold">Teléfono Propietario</label>
                      <input className="form-control" value={form.telefonoPropietario} onChange={(e) => setField("telefonoPropietario", e.target.value)} placeholder="Ej: 999888777" />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted fw-bold">Contraseña Inicial</label>
                      <input type="password" className="form-control" value={form.contrasenaPropietario} onChange={(e) => setField("contrasenaPropietario", e.target.value)} />
                    </div>
                  </div>

                </div>
                <div className="modal-footer bg-light">
                  <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                  <button className="btn btn-success px-4" onClick={crearClub}>Registrar Club</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL EDITAR ================= */}
      {editando && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold"><FaEdit className="me-2"/>Editar Club</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditando(null)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Nombre del Club</label>
                    <input className="form-control" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Correo Contacto</label>
                    <input className="form-control" value={editando.correoContacto} onChange={(e) => setEditando({ ...editando, correoContacto: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Teléfono</label>
                    <input className="form-control" value={editando.telefonoContacto} onChange={(e) => setEditando({ ...editando, telefonoContacto: e.target.value })} />
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