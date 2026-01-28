import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import { FaPlus, FaPowerOff, FaEdit, FaSearch, FaUserShield, FaIdCard, FaEnvelope, FaPhone } from "react-icons/fa";
import { consultarDni } from "../../services/dniService";

export default function SubAdministradores() {
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState("");

  const initialForm = {
    dni: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: ""
  };

  const [form, setForm] = useState(initialForm);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // =========================
  // LISTAR (Asegúrate que tu Backend devuelva el campo 'dni')
  // =========================
  const cargarSubadmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/subadmins");
      console.log("Datos recibidos:", res.data); // Revisa en consola si viene el campo 'dni'
      setSubadmins(res.data || []);
    } catch {
      Swal.fire("Error", "No se pudo cargar subadministradores", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarSubadmins();
  }, [cargarSubadmins]);

  const cargarPorDni = async () => {
    if (!form.dni || form.dni.length !== 8) {
      return Swal.fire("Atención", "Ingresa un DNI válido de 8 dígitos", "warning");
    }
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

  const crearSubadmin = async () => {
    const required = ["dni", "nombres", "apellidos", "correo", "telefono", "contrasena"];
    const vacios = required.filter(k => !form[k]);
    if (vacios.length) return Swal.fire("Campos incompletos", "Completa todos los campos", "warning");

    try {
      await api.post("/admin/subadmins", form);
      Swal.fire("Éxito", "Subadministrador creado", "success");
      cerrarModal();
      cargarSubadmins();
    } catch (err) {
      Swal.fire("Error", err.response?.data || "Error al crear", "error");
    }
  };

  const editarSubadmin = async () => {
    try {
      await api.put(`/admin/subadmins/${editando.idSubadmin}`, {
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono
      });
      Swal.fire("Actualizado", "Datos actualizados correctamente", "success");
      cerrarModal();
      cargarSubadmins();
    } catch {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const cambiarEstado = async (sub) => {
    const nuevoEstado = sub.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const ok = await Swal.fire({
      title: "¿Cambiar estado?",
      text: `El usuario pasará a estar ${nuevoEstado}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      confirmButtonColor: sub.estado === "ACTIVO" ? "#dc3545" : "#198754"
    });
    if (!ok.isConfirmed) return;

    try {
      await api.put(`/admin/subadmins/${sub.idSubadmin}/estado`, { estado: nuevoEstado });
      cargarSubadmins();
    } catch {
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    setForm(initialForm);
  };

  const subadminsFiltrados = subadmins.filter(s => 
    `${s.nombres} ${s.apellidos}`.toLowerCase().includes(filtro.toLowerCase()) ||
    s.correo.toLowerCase().includes(filtro.toLowerCase()) ||
    (s.dni && s.dni.includes(filtro))
  );

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 bg-white p-3 rounded-4 shadow-sm border border-light">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaUserShield className="me-2 text-primary"/>Subadministradores</h2>
          <p className="text-muted mb-0 small text-uppercase fw-bold">Gestión de accesos y personal</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm mt-3 mt-md-0 border-0" onClick={() => setModalOpen(true)}>
          <FaPlus className="me-2"/> NUEVO SUBADMIN
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control border-0 bg-light shadow-none" 
              placeholder="Buscar por nombre, correo o DNI..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-secondary small text-uppercase fw-bold">
              <tr>
                <th className="ps-4 py-3">Nombre Completo</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></td></tr>
              ) : subadminsFiltrados.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No se encontraron registros</td></tr>
              ) : subadminsFiltrados.map(s => (
                <tr key={s.idSubadmin}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark">{s.nombres} {s.apellidos}</div>
                    {/* MOSTRAMOS EL DNI AQUÍ */}
                    <small className="text-primary fw-bold"><FaIdCard className="me-1"/> {s.dni || "DNI No disponible"}</small>
                  </td>
                  <td>
                    <div className="small text-dark"><FaEnvelope className="me-1 opacity-50"/> {s.correo}</div>
                    <div className="small text-muted"><FaPhone className="me-1 opacity-50"/> {s.telefono || "—"}</div>
                  </td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-2 ${s.estado === "ACTIVO" ? "bg-success-subtle text-success border border-success" : "bg-danger-subtle text-danger border border-danger"}`}>
                      {s.estado}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="btn-group border rounded-3 overflow-hidden bg-white shadow-sm">
                      <button
                        className="btn btn-sm text-primary border-0 py-2 px-3"
                        onClick={() => {
                          setEditando(s);
                          setForm({
                            dni: s.dni || "", // Cargamos el DNI existente al editar
                            correo: s.correo,
                            contrasena: "",
                            nombres: s.nombres, 
                            apellidos: s.apellidos, 
                            telefono: s.telefono || ""
                          });
                          setModalOpen(true);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`btn btn-sm border-0 py-2 px-3 ${s.estado === "ACTIVO" ? "text-danger" : "text-success"}`}
                        onClick={() => cambiarEstado(s)}
                      >
                        <FaPowerOff />
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
          <div className="bg-white rounded-4 shadow-lg animate__animated animate__zoomIn" style={{ width: '95%', maxWidth: '550px', maxHeight: '95vh', overflowY: 'auto' }}>
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-primary text-white rounded-top-4">
              <h4 className="fw-bold mb-0">
                {editando ? "Editar Subadministrador" : "Nuevo Subadministrador"}
              </h4>
              <button className="btn-close btn-close-white shadow-none" onClick={cerrarModal} />
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Documento de Identidad (DNI)</label>
                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                  <input
                    className="form-control border-0 bg-light py-2 px-3 shadow-none"
                    placeholder="8 dígitos"
                    value={form.dni}
                    maxLength={8}
                    disabled={!!editando} // Bloqueado si estás editando
                    onChange={e => setField("dni", e.target.value)}
                  />
                  {!editando && (
                    <button className="btn btn-primary px-4 fw-bold" type="button" onClick={cargarPorDni}>
                      BUSCAR
                    </button>
                  )}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Nombres</label>
                  <input className="form-control bg-light border-0 py-2 shadow-none" value={form.nombres} onChange={e => setField("nombres", e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Apellidos</label>
                  <input className="form-control bg-light border-0 py-2 shadow-none" value={form.apellidos} onChange={e => setField("apellidos", e.target.value)} />
                </div>
                {!editando && (
                  <>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase">Correo Electrónico</label>
                      <input className="form-control bg-light border-0 py-2 shadow-none" type="email" value={form.correo} onChange={e => setField("correo", e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase">Contraseña</label>
                      <input className="form-control bg-light border-0 py-2 shadow-none" type="password" value={form.contrasena} onChange={e => setField("contrasena", e.target.value)} />
                    </div>
                  </>
                )}
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Teléfono</label>
                  <input className="form-control bg-light border-0 py-2 shadow-none" value={form.telefono} onChange={e => setField("telefono", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="p-4 border-top bg-light rounded-bottom-4 text-end">
              <button className="btn btn-link text-muted fw-bold text-decoration-none me-3" onClick={cerrarModal}>
                CANCELAR
              </button>
              <button
                className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm border-0"
                onClick={editando ? editarSubadmin : crearSubadmin}
              >
                {editando ? "GUARDAR CAMBIOS" : "REGISTRAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ls-1 { letter-spacing: 0.5px; }
        .bg-success-subtle { background-color: #d1e7dd !important; }
        .bg-danger-subtle { background-color: #f8d7da !important; }
        .table-hover tbody tr:hover { background-color: #f8faff !important; }
      `}</style>
    </div>
  );
}