import { useEffect, useState, useCallback, useMemo } from "react";
import { FaUserPlus, FaPlus, FaSearch, FaIdCard, FaEnvelope, FaEdit, FaLock, FaPhone } from "react-icons/fa";
import api from "../../services/axiosConfig";
import { consultarDni } from "../../services/dniService";
import Swal from "sweetalert2";

export default function AdminCompetidores() {
  // =========================
  // ESTADOS
  // =========================
  const [busqueda, setBusqueda] = useState("");
  const [clubes, setClubes] = useState([]);
  const [competidores, setCompetidores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompetidores, setTotalCompetidores] = useState(0);

  const initialForm = {
    dni: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    contrasena: "Robot2026*",
    codigoClub: ""
  };

  const [form, setForm] = useState(initialForm);

  // =========================
  // CARGA DE DATOS
  // =========================
  const PAGE_SIZE = 20;

  const cargarClubes = useCallback(async () => {
    try {
      const resClubes = await api.get("/public/clubes");
      setClubes(resClubes.data || []);
    } catch (err) {
      Swal.fire("Error", "No se pudo cargar la lista de clubes", "error");
    }
  }, []);

  const cargarCompetidores = useCallback(async () => {
    setLoading(true);
    try {
      const resComp = await api.get("/admin/usuarios", {
        params: {
          page: page - 1,
          size: PAGE_SIZE,
          q: busqueda?.trim() || undefined,
          role: "COMPETIDOR",
          rol: "COMPETIDOR"
        }
      });
      const data = resComp.data || {};
      const content = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
      const competidoresSolo = content.filter((u) =>
        Array.isArray(u.roles) ? u.roles.includes("COMPETIDOR") : true
      );
      setCompetidores(competidoresSolo);
      setTotalPages(data.totalPages ?? 1);
      setTotalCompetidores(data.totalElements ?? competidoresSolo.length);
    } catch (err) {
      Swal.fire("Error", "No se pudo sincronizar la información", "error");
    } finally {
      setLoading(false);
    }
  }, [page, busqueda]);

  useEffect(() => {
    cargarClubes();
  }, [cargarClubes]);

  useEffect(() => {
    cargarCompetidores();
  }, [cargarCompetidores]);

  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [page, totalPages]);

  // =========================
  // LÓGICA DNI
  // =========================
  const cargarPorDni = async () => {
    if (form.dni.length !== 8) return Swal.fire("Atención", "DNI debe ser de 8 dígitos", "warning");
    try {
      Swal.fire({ title: "Consultando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const data = await consultarDni(form.dni);
      setForm(prev => ({ ...prev, nombre: data.nombres, apellido: data.apellidos }));
      Swal.close();
    } catch (err) {
      Swal.fire("Error", "No se encontró el DNI", "error");
    }
  };

  // =========================
  // FILTRADO
  // =========================
  const competidoresMostrados = useMemo(() => competidores, [competidores]);

  // =========================
  // ACCIONES
  // =========================
  const abrirModalCrear = () => {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const abrirEditar = (c) => {
    setEditingId(c.idUsuario);
    setForm({
      dni: c.dni || "",
      nombre: c.nombres || "",
      apellido: c.apellidos || "",
      correo: c.correo || "",
      telefono: c.telefono || "",
      contrasena: "",
      codigoClub: c.idClub || ""
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dni || !form.nombre || !form.correo) {
      return Swal.fire("Atención", "Campos obligatorios incompletos", "warning");
    }

    try {
      const telefonoLimpio = form.telefono && form.telefono.trim() !== "" ? form.telefono.trim() : null;

      if (!editingId) {
        await api.post("/admin/competidores", { ...form, telefono: telefonoLimpio });
        Swal.fire({ icon: "success", title: "¡Registrado!", timer: 1500, showConfirmButton: false });
      } else {
        await api.put(`/admin/competidores/${editingId}`, {
          nombres: form.nombre,
          apellidos: form.apellido,
          dni: form.dni,
          correo: form.correo,
          telefono: telefonoLimpio
        });
        Swal.fire({ icon: "success", title: "Datos Actualizados", timer: 1500, showConfirmButton: false });
      }
      setModalOpen(false);
      cargarCompetidores();
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error: DNI o Correo ya registrados.";
      Swal.fire("Error", msg, "error");
    }
  };

  return (
    <div className="container-fluid px-4 mt-4 animate__animated animate__fadeIn">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaUserPlus className="me-2 text-primary" />Gestión de Competidores</h2>
          <p className="text-muted mb-0 small text-uppercase fw-bold" style={{ letterSpacing: "0.5px" }}>Administración de Participantes</p>
        </div>
        <button className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold border-0" onClick={abrirModalCrear}>
          <FaPlus className="me-2" /> REGISTRAR COMPETIDOR
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted" /></span>
            <input type="text" className="form-control border-0 bg-light shadow-none" placeholder="Buscar por nombre, DNI o teléfono..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-secondary small text-uppercase fw-bold">
              <tr>
                <th className="ps-4 py-3">Competidor</th>
                <th>DNI / ID</th>
                <th>Contacto</th>
                <th>Club</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && !modalOpen ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
              ) : (
                competidoresMostrados.map((c) => (
                  <tr key={c.idUsuario}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 fw-bold shadow-sm" style={{ width: "40px", height: "40px" }}>
                          {c.nombres?.charAt(0)}
                        </div>
                        <div className="fw-bold text-dark">{c.nombres} {c.apellidos}</div>
                      </div>
                    </td>
                    <td className="text-secondary">{c.dni}</td>
                    <td>
                      <div className="d-flex flex-column small">
                        <span className="text-dark"><FaEnvelope className="me-2 text-primary opacity-50" />{c.correo}</span>
                        <span className="text-secondary mt-1">
                          <FaPhone className="me-2 text-success opacity-50" />
                          {c.telefono || <span className="text-muted fst-italic">Sin teléfono</span>}
                        </span>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark border fw-normal">{c.clubNombre || "—"}</span></td>
                    <td className="text-end pe-4">
                      <button className="btn btn-outline-primary border-0 rounded-3 py-2" onClick={() => abrirEditar(c)}>
                        <FaEdit className="me-1" /> Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && totalCompetidores > 0 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div className="text-muted small">
            Mostrando {competidores.length} de {totalCompetidores} competidores
          </div>
          <div className="btn-group">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(1)}
              disabled={page <= 1}
            >
              Primero
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <span className="btn btn-light btn-sm disabled">
              Página {page} de {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Siguiente
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              Último
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="d-flex align-items-center justify-content-center" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 2050, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)" }}>
          <div className="bg-white rounded-4 shadow-lg animate__animated animate__zoomIn" style={{ width: "95%", maxWidth: "600px" }}>
            <div className="modal-header bg-primary text-white border-0 py-3 px-4">
              <h5 className="modal-title fw-bold"><FaUserPlus className="me-2" />{editingId ? "Actualizar Datos" : "Nuevo Competidor"}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">Documento de Identidad *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><FaIdCard className="text-muted" /></span>
                      <input
                        className="form-control bg-light border-0 shadow-none"
                        value={form.dni}
                        onChange={e => setForm({ ...form, dni: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                        placeholder="8 dígitos"
                        inputMode="numeric"
                        maxLength={8}
                      />
                      <button type="button" className="btn btn-info text-white fw-bold px-4 shadow-none" onClick={cargarPorDni}>CONSULTAR</button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Nombres *</label>
                    <input className="form-control bg-light border-0 py-2 shadow-none" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Apellidos *</label>
                    <input className="form-control bg-light border-0 py-2 shadow-none" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Email *</label>
                    <input type="email" className="form-control bg-light border-0 py-2 shadow-none" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Teléfono</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0"><FaPhone className="text-muted" size={12} /></span>
                      <input
                        type="tel"
                        className="form-control bg-light border-0 py-2 shadow-none"
                        value={form.telefono}
                        onChange={e => setForm({ ...form, telefono: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                        placeholder="987654321"
                        inputMode="numeric"
                        maxLength={9}
                      />
                    </div>
                  </div>

                  {!editingId && (
                    <>
                      <div className="col-12 mt-2">
                        <label className="form-label small fw-bold text-muted text-uppercase">Club de Pertenencia *</label>
                        <select className="form-select bg-light border-0 py-2 shadow-none" value={form.codigoClub} onChange={e => setForm({ ...form, codigoClub: e.target.value })} required>
                          <option value="">Seleccionar Club...</option>
                          {clubes.map(cl => <option key={cl.idClub} value={cl.idClub}>{cl.nombre}</option>)}
                        </select>
                      </div>
                      <div className="col-12 mt-3 pt-3 border-top">
                        <label className="form-label small fw-bold text-primary text-uppercase">Clave Temporal</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0"><FaLock className="text-muted" size={12} /></span>
                          <input type="text" className="form-control bg-light border-0 py-2 shadow-none fw-bold text-primary" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pb-4 px-4">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-bold text-muted" onClick={() => setModalOpen(false)}>CANCELAR</button>
                <button type="submit" className="btn btn-success rounded-pill px-5 shadow fw-bold border-0">
                  {editingId ? "GUARDAR CAMBIOS" : "FINALIZAR REGISTRO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .form-control:focus, .form-select:focus { border-color: #0d6efd !important; box-shadow: none !important; }
        .table-hover tbody tr:hover { background-color: #f8faff !important; }
      `}</style>
    </div>
  );
}

