import { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaSearch, FaEdit, FaPowerOff, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaTimes, FaLock, FaCheck, FaBan } from "react-icons/fa";
import api from "../../services/axiosConfig";
import { consultarDni } from "../../services/dniService";

export default function SubAdminRegistrarClub() {
  // =========================
  // ESTADOS
  // =========================
  const [busqueda, setBusqueda] = useState("");
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    nombre: "", correoContacto: "", telefonoContacto: "", direccionFiscal: "",
    dniPropietario: "", nombresPropietario: "", apellidosPropietario: "",
    correoPropietario: "", telefonoPropietario: "", contrasenaPropietario: "Club2026*"
  };

  const [form, setForm] = useState(initialForm);

  // =========================
  // CARGA DE DATOS
  // =========================
  const cargarClubes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/clubes");
      setClubes(res.data || []);
    } catch (err) {
      Swal.fire("Error", "No se pudo cargar la lista", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarClubes(); }, [cargarClubes]);

  const clubesFiltrados = useMemo(() => {
    const term = busqueda.toLowerCase();
    return clubes.filter(c => (c.nombre || "").toLowerCase().includes(term));
  }, [clubes, busqueda]);

  // =========================
  // LÓGICA DNI
  // =========================
  const cargarPorDni = async () => {
    if (form.dniPropietario.length !== 8) return Swal.fire("Atención", "DNI de 8 dígitos", "warning");
    try {
      Swal.fire({ title: "Consultando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const data = await consultarDni(form.dniPropietario);
      setForm(prev => ({ ...prev, nombresPropietario: data.nombres, apellidosPropietario: data.apellidos }));
      Swal.close();
    } catch (err) { Swal.fire("Error", "DNI no encontrado", "error"); }
  };

  // =========================
  // ACCIONES
  // =========================
  const abrirModalCrear = () => { 
    setForm(initialForm); 
    setEditingId(null); 
    setModalOpen(true); 
  };

  const abrirEditar = (club) => {
    setEditingId(club.idClub);
    // Mapeamos los campos que ahora sí envía tu ClubResponseDTO actualizado
    setForm({
      nombre: club.nombre || "",
      correoContacto: club.correoContacto || "",
      telefonoContacto: club.telefonoContacto || "",
      direccionFiscal: club.direccionFiscal || "",
      dniPropietario: club.dniPropietario || "",
      nombresPropietario: club.nombresPropietario || "",
      apellidosPropietario: club.apellidosPropietario || "",
      correoPropietario: club.correoPropietario || "",
      telefonoPropietario: club.telefonoPropietario || "",
      contrasenaPropietario: "" // No se edita por seguridad
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editingId) {
        // ✅ SOLUCIÓN AL ERROR 500: Recuperamos el estado actual para que no viaje nulo
        const clubOriginal = clubes.find(c => c.idClub === editingId);
        const payload = {
          ...form,
          estado: clubOriginal?.estado || "ACTIVO"
        };
        await api.put(`/admin/clubes/${editingId}`, payload);
        Swal.fire("¡Éxito!", "Club actualizado correctamente", "success");
      } else {
        await api.post("/admin/clubes", form);
        Swal.fire("¡Éxito!", "Club registrado correctamente", "success");
      }
      setModalOpen(false);
      cargarClubes();
    } catch (err) {
      console.error("Error API:", err.response?.data);
      Swal.fire("Error", err.response?.data?.mensaje || "Error al procesar la solicitud", "error");
    }
  };

  const cambiarEstado = async (club) => {
    const esActivacion = club.estado !== "ACTIVO";
    const nuevoEstado = esActivacion ? "ACTIVO" : "INACTIVO";

    const result = await Swal.fire({
      title: esActivacion ? "¿Activar Club?" : "¿Desactivar Club?",
      text: `El club pasará a estar ${nuevoEstado}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: esActivacion ? "#198754" : "#d33",
      confirmButtonText: "Sí, cambiar"
    });

    if (result.isConfirmed) {
      try {
        // Enviamos el objeto con el estado cambiado
        await api.put(`/admin/clubes/${club.idClub}`, { ...club, estado: nuevoEstado });
        Swal.fire("Cambiado", `Estado: ${nuevoEstado}`, "success");
        cargarClubes();
      } catch (err) { 
        Swal.fire("Error", "No se pudo cambiar el estado", "error"); 
      }
    }
  };

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaBuilding className="me-2 text-primary"/>Gestión de Clubes</h2>
          <p className="text-muted mb-0 small text-uppercase fw-bold">Administración de Entidades</p>
        </div>
        <button className="btn btn-primary shadow-sm rounded-pill px-4 fw-bold border-0" onClick={abrirModalCrear}>
          <FaPlus className="me-2"/> REGISTRAR CLUB
        </button>
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted"/></span>
            <input type="text" className="form-control border-0 shadow-none bg-light" placeholder="Buscar club por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-secondary small text-uppercase fw-bold">
              <tr>
                <th className="ps-4 py-3">Club</th>
                <th>Contacto</th>
                <th>Ubicación</th>
                <th className="text-center">Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
              ) : clubesFiltrados.map((c) => (
                <tr key={c.idClub}>
                  <td className="ps-4 fw-bold text-dark">{c.nombre}</td>
                  <td>
                    <div className="d-flex flex-column small">
                      <span className="text-dark"><FaEnvelope className="me-1 text-muted"/>{c.correoContacto}</span>
                      <span className="text-muted"><FaPhone className="me-1 text-muted"/>{c.telefonoContacto}</span>
                    </div>
                  </td>
                  <td><small className="text-muted"><FaMapMarkerAlt className="me-1 text-danger"/>{c.direccionFiscal || "—"}</small></td>
                  <td className="text-center">
                    <span className={`badge rounded-pill px-3 py-2 ${c.estado === "ACTIVO" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="btn-group border rounded-3 overflow-hidden bg-white shadow-sm">
                      <button className="btn btn-sm text-primary border-0 py-2" onClick={() => abrirEditar(c)} title="Editar"><FaEdit /></button>
                      <button className={`btn btn-sm border-0 py-2 ${c.estado === 'ACTIVO' ? 'text-danger' : 'text-success'}`} onClick={() => cambiarEstado(c)} title="Cambiar Estado">
                        {c.estado === 'ACTIVO' ? <FaBan /> : <FaCheck />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="d-flex align-items-center justify-content-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2050, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
          <div className="bg-white rounded-4 shadow-lg animate__animated animate__zoomIn" style={{ width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-4 border-bottom bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="fw-bold mb-0"><FaBuilding className="me-2" /> {editingId ? "Editar Club" : "Registrar Club"}</h4>
              <button className="btn-close btn-close-white" onClick={() => setModalOpen(false)}></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="row g-4">
                <div className="col-md-6 border-end">
                  <h6 className="fw-bold text-primary mb-3 text-uppercase small">Información del Club</h6>
                  <div className="mb-3"><label className="form-label small fw-bold text-muted">NOMBRE *</label><input className="form-control bg-light border-0" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required /></div>
                  <div className="mb-3"><label className="form-label small fw-bold text-muted">CORREO CONTACTO *</label><input type="email" className="form-control bg-light border-0" value={form.correoContacto} onChange={(e) => setForm({...form, correoContacto: e.target.value})} required /></div>
                  <div className="mb-3"><label className="form-label small fw-bold text-muted">TELÉFONO CONTACTO *</label><input className="form-control bg-light border-0" value={form.telefonoContacto} onChange={(e) => setForm({...form, telefonoContacto: e.target.value})} required /></div>
                  <div className="mb-3"><label className="form-label small fw-bold text-muted">DIRECCIÓN FISCAL</label><input className="form-control bg-light border-0" value={form.direccionFiscal} onChange={(e) => setForm({...form, direccionFiscal: e.target.value})} /></div>
                </div>

                <div className="col-md-6">
                  <h6 className="fw-bold text-success mb-3 text-uppercase small">Datos del Propietario</h6>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">DNI PROPIETARIO *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0"><FaIdCard className="text-muted"/></span>
                      <input className="form-control bg-white border-start-0" value={form.dniPropietario} onChange={(e) => setForm({...form, dniPropietario: e.target.value})} required />
                      <button type="button" className="btn btn-info text-white fw-bold px-3" onClick={cargarPorDni}>DNI</button>
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6"><label className="form-label small fw-bold text-muted">NOMBRES</label><input className="form-control bg-light border-0" value={form.nombresPropietario} readOnly /></div>
                    <div className="col-6"><label className="form-label small fw-bold text-muted">APELLIDOS</label><input className="form-control bg-light border-0" value={form.apellidosPropietario} readOnly /></div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">CORREO PROPIETARIO *</label>
                    <input type="email" className="form-control bg-white" value={form.correoPropietario} onChange={(e) => setForm({...form, correoPropietario: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">TELÉFONO PROPIETARIO</label>
                    <input className="form-control bg-white" value={form.telefonoPropietario} onChange={(e) => setForm({...form, telefonoPropietario: e.target.value})} />
                  </div>
                  
                  {!editingId && (
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">CONTRASEÑA INICIAL *</label>
                      <input type="text" className="form-control bg-white fw-bold text-primary" value={form.contrasenaPropietario} onChange={(e) => setForm({...form, contrasenaPropietario: e.target.value})} required />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-top text-end">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-bold me-2" onClick={() => setModalOpen(false)}>CANCELAR</button>
                <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow border-0">{editingId ? "GUARDAR CAMBIOS" : "FINALIZAR REGISTRO"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .ls-1 { letter-spacing: 0.5px; }
        .form-control:focus { box-shadow: none !important; border-color: #0d6efd !important; }
        .table-hover tbody tr:hover { background-color: #f8faff !important; }
        .bg-success-subtle { background-color: #d1e7dd !important; }
        .bg-danger-subtle { background-color: #f8d7da !important; }
      `}</style>
    </div>
  );
}