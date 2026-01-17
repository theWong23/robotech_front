import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaCheck, FaTimes, FaUserTie } from "react-icons/fa";
import api from "../../services/axiosConfig"; // Asegúrate de que apunte a tu config de axios

export default function AdminJueces() {
  // =========================
  // ESTADOS
  // =========================
  const [jueces, setJueces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal & Formulario
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    correo: "",
    telefono: "",
    contrasena: "",
    licencia: ""
  });

  // =========================
  // UTILS
  // =========================
  const getAdminId = () => {
    try {
      const usuarioStr = localStorage.getItem("usuario");
      if (!usuarioStr) return null;
      const usuario = JSON.parse(usuarioStr);
      return usuario.idUsuario || usuario.entidad?.idUsuario || usuario.id;
    } catch (e) {
      return null;
    }
  };

  const adminId = getAdminId();

  // =========================
  // CARGA DE DATOS
  // =========================
  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/jueces");
      setJueces(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar la lista de jueces", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // =========================
  // LÓGICA DE FILTRADO (VISUAL)
  // =========================
  const juecesFiltrados = useMemo(() => {
    return jueces.filter((j) => {
      const termino = searchTerm.toLowerCase();
      const correo = j.usuario?.correo?.toLowerCase() || "";
      const licencia = j.licencia?.toLowerCase() || "";
      return correo.includes(termino) || licencia.includes(termino);
    });
  }, [jueces, searchTerm]);

  // =========================
  // MANEJO DEL FORMULARIO
  // =========================
  const abrirCrear = () => {
    setForm({ correo: "", telefono: "", contrasena: "", licencia: "" });
    setEditingId(null);
    setModal(true);
  };

  const abrirEditar = (j) => {
    setEditingId(j.idJuez);
    setForm({
      correo: j.usuario?.correo || "",
      telefono: j.usuario?.telefono || "",
      contrasena: "", // Se deja vacía para no sobrescribir si no se toca
      licencia: j.licencia
    });
    setModal(true);
  };

  // =========================
  // GUARDAR (LÓGICA DELEGADA AL BACKEND)
  // =========================
  const guardar = async () => {
    // 1. Validación mínima de UI (campos obligatorios)
    if (!form.correo || !form.licencia) {
      return Swal.fire("Atención", "Correo y Licencia son obligatorios", "warning");
    }
    
    if (!adminId) {
      return Swal.fire("Error de Sesión", "Relogueate como administrador.", "error");
    }

    try {
      // 2. Preparar datos
      // El backend validará si el correo es válido, si la licencia es única, etc.
      if (!editingId) {
        // Crear
        await api.post("/admin/jueces", { ...form, creadoPor: adminId });
        Swal.fire({ icon: 'success', title: 'Creado', text: 'Juez registrado correctamente', timer: 1500 });
      } else {
        // Editar
        const payload = { ...form };
        // Si la contraseña está vacía, la quitamos para que el backend sepa que no debe cambiarla
        if (!payload.contrasena) delete payload.contrasena; 
        
        await api.put(`/admin/jueces/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Datos modificados correctamente', timer: 1500 });
      }
      
      setModal(false);
      cargar(); // Recargar lista

    } catch (err) {
      // 3. Manejo de Errores del Backend
      const msg = err.response?.data?.mensaje || "No se pudo guardar la información";
      Swal.fire("Error", msg, "error");
    }
  };

  // =========================
  // ACCIONES (ELIMINAR / ESTADO)
  // =========================
  const eliminar = async (idJuez) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El backend determinará si se puede eliminar o desactivar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/jueces/${idJuez}`);
        Swal.fire("Procesado", "Acción realizada correctamente.", "success");
        cargar();
      } catch (err) {
        const msg = err.response?.data?.mensaje || "No se pudo eliminar";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const cambiarEstado = async (idJuez, accion) => {
    if (!adminId) return Swal.fire("Error", "Sesión inválida", "error");
    
    try {
      await api.put(`/admin/jueces/${idJuez}/${accion}`, {}, {
        headers: { "admin-id": adminId }
      });
      
      const msg = accion === "aprobar" ? "Juez aprobado con éxito" : "Juez rechazado";
      Swal.fire("Correcto", msg, "success");
      cargar();
    } catch (err) {
      const msg = err.response?.data?.mensaje || `No se pudo ${accion} al juez`;
      Swal.fire("Error", msg, "error");
    }
  };

  const formatFecha = (f) => f ? new Date(f).toLocaleDateString() : "—";

  // =========================
  // RENDER (VISUALMENTE IDÉNTICO)
  // =========================
  return (
    <div className="container-fluid px-4 mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaUserTie className="me-2"/>Gestión de Jueces</h2>
          <p className="text-muted">Administra los accesos y validaciones.</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={abrirCrear}>
          <FaPlus className="me-2" /> Nuevo Juez
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-light border-0"><FaSearch className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control border-0 bg-light" 
              placeholder="Buscar por correo o licencia..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="ps-4">Juez</th>
                  <th>Contacto</th>
                  <th>Licencia</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
                ) : juecesFiltrados.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-5">No se encontraron resultados</td></tr>
                ) : (
                  juecesFiltrados.map(j => (
                    <tr key={j.idJuez}>
                      <td className="ps-4">
                        <div className="fw-bold">{j.usuario?.correo}</div>
                        <small className="text-muted">ID: {j.idJuez.substring(0,8)}...</small>
                      </td>
                      <td>{j.usuario?.telefono || "—"}</td>
                      <td><span className="badge bg-secondary">{j.licencia}</span></td>
                      <td>
                        <span className={`badge rounded-pill ${
                          j.estadoValidacion === "APROBADO" ? "bg-success" :
                          j.estadoValidacion === "RECHAZADO" ? "bg-danger" : "bg-warning text-dark"
                        }`}>
                          {j.estadoValidacion}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          Creado: {formatFecha(j.creadoEn)} <br/>
                          {j.validadoEn && <span>Validado: {formatFecha(j.validadoEn)}</span>}
                        </small>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          {j.estadoValidacion === "PENDIENTE" && (
                            <>
                              <button className="btn btn-outline-success btn-sm" title="Aprobar" onClick={() => cambiarEstado(j.idJuez, 'aprobar')}>
                                <FaCheck />
                              </button>
                              <button className="btn btn-outline-danger btn-sm" title="Rechazar" onClick={() => cambiarEstado(j.idJuez, 'rechazar')}>
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button className="btn btn-outline-primary btn-sm" title="Editar" onClick={() => abrirEditar(j)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-outline-danger btn-sm" title="Eliminar" onClick={() => eliminar(j.idJuez)}>
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

      {/* MODAL */}
      {modal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">
                    {editingId ? <><FaEdit className="me-2"/>Editar Juez</> : <><FaPlus className="me-2"/>Crear Juez</>}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">CORREO ELECTRÓNICO</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={form.correo} 
                      onChange={e => setForm({ ...form, correo: e.target.value })}
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-muted small">TELÉFONO</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        value={form.telefono} 
                        onChange={e => setForm({ ...form, telefono: e.target.value })} 
                        maxLength={15} // Dejamos margen por si el formato cambia
                        placeholder="999999999"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-muted small">LICENCIA</label>
                      <input 
                        className="form-control" 
                        value={form.licencia} 
                        onChange={e => setForm({ ...form, licencia: e.target.value })} 
                        placeholder="Código Licencia"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted small">
                      CONTRASEÑA {editingId && <span className="fw-normal text-muted">(Dejar en blanco para mantener actual)</span>}
                    </label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={form.contrasena} 
                      onChange={e => setForm({ ...form, contrasena: e.target.value })}
                      placeholder={editingId ? "********" : "Mínimo 6 caracteres"}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button className="btn btn-link text-secondary text-decoration-none" onClick={() => setModal(false)}>Cancelar</button>
                  <button className="btn btn-primary px-4" onClick={guardar}>Guardar Datos</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}