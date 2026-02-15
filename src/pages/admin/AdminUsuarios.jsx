import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { 
  FaUserPlus, FaEdit, FaTrash, FaKey, FaSearch, FaUserShield, 
  FaEnvelope, FaPhone, FaEye, FaEyeSlash 
} from "react-icons/fa";
import api from "../../services/axiosConfig"; // Asegúrate de que apunte a tu configuración de axios
import { consultarDni } from "../../services/dniService";

const ADMIN_ROLE = "ADMINISTRADOR";
const ESTADOS = ["ACTIVO", "INACTIVO", "PENDIENTE"];

export default function AdminUsuarios() {
  // ============================
  // ESTADOS
  // ============================
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  // Modales
  const [modal, setModal] = useState(false);
  const [modalPass, setModalPass] = useState(false);
  
  // Identificadores para edición
  const [editingId, setEditingId] = useState(null);
  const [passId, setPassId] = useState(null);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const [fieldErrors, setFieldErrors] = useState({});
  const hasError = (field) => Boolean(fieldErrors[field]);

  // Formulario
  const [form, setForm] = useState({
    dni:"",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: "",
    roles: [ADMIN_ROLE],
    estado: "ACTIVO",
  });

  const [newPass, setNewPass] = useState("");
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);



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
  // ============================
  // CARGA DE DATOS
  // ============================
  const PAGE_SIZE = 20;

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/usuarios", {
        params: {
          page: page - 1,
          size: PAGE_SIZE,
          q: busqueda?.trim() || undefined
        }
      });

      const data = res.data || {};
      const content = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);

      setUsuarios(content);
      setTotalPages(data.totalPages ?? 1);
      setTotalUsuarios(data.totalElements ?? content.length);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "No se pudo cargar la lista de usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [page, busqueda]);

  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [page, totalPages]);

  // ============================
  // GESTIÓN DE FORMULARIO
  // ============================
  const resetForm = () => {
    setForm({
      dni: "", nombres: "", apellidos: "", correo: "", telefono: "",
      contrasena: "", roles: [ADMIN_ROLE], estado: "ACTIVO"
    });
    setFieldErrors({});
  };

  const abrirCrear = () => {
    resetForm();
    setEditingId(null);
    setModal(true);
  };

  const abrirEditar = (u) => {
    setEditingId(u.idUsuario);
    setForm({
      dni: u.dni ?? "",        
      nombres: u.nombres ?? "",
      apellidos: u.apellidos ?? "",
      correo: u.correo ?? "",
      telefono: u.telefono ?? "",
      contrasena: "",
      roles: u.roles ?? [ADMIN_ROLE],
      estado: u.estado ?? "ACTIVO",
    });
    setModal(true);
  };

  const validarCampo = (field, value) => {
    switch (field) {
      case "correo":
        if (!value) return "El correo es obligatorio";
        if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(value))
          return "Formato de correo inválido";
        return null;

      case "telefono":
        if (!value) return "El teléfono es obligatorio";
        if (!/^9\d{8}$/.test(value))
          return "El teléfono debe tener 9 dígitos y empezar con 9";
        return null;

      case "nombres":
        if (!value) return "Los nombres son obligatorios";
        return null;

      case "apellidos":
        if (!value) return "Los apellidos son obligatorios";
        return null;

      default:
        return null;
    }
  };

    const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    let error = validarCampo(field, value);

    if (field === "contrasena") {
      if (!value) {
        error = "La contraseña es obligatoria";
      } else if (!passwordRegex.test(value)) {
        error = "Debe tener 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial";
      }
    }
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // ============================
  // GUARDAR (LÓGICA DELEGADA AL BACKEND)
  // ============================
  const guardar = async () => {
    const errores = {};

    ["correo", "telefono", "nombres", "apellidos"].forEach(field => {
      const error = validarCampo(field, form[field]);
      if (error) errores[field] = error;
    });

    if (!isEditing) {
      if (!form.contrasena) errores.contrasena = "La contraseña es obligatoria";
      else if (!passwordRegex.test(form.contrasena))
        errores.contrasena = "Debe tener 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial";
    }

    if (Object.keys(errores).length > 0) {
      setFieldErrors(errores);

      Swal.fire({
        icon: "error",
        title: "Formulario incompleto",
        text: "Corrige los errores antes de continuar",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    try {
      const payload = {
        dni: form.dni.trim(),
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        // Blindaje: no permitir mutaciÃ³n de roles desde esta pantalla.
        roles: isEditing ? undefined : [ADMIN_ROLE],
        estado: form.estado,
        ...( !isEditing && { contrasena: form.contrasena } )
      };

      let res;

      if (!isEditing) {
        res = await api.post("/admin/usuarios", payload);
      } else {
        res = await api.put(`/admin/usuarios/${editingId}`, payload);
      }

      console.log("RESPUESTA BACKEND:", res.data);

      if (res.data?.fieldErrors) {
        setFieldErrors(res.data.fieldErrors);

        const mensaje = Object.values(res.data.fieldErrors)[0];

        Swal.fire({
          icon: "error",
          title: "Error",
          text: mensaje, // mensaje exacto del backend
          confirmButtonText: "Aceptar",
        });

        return;
      }

    
      Swal.fire({
        icon: "success",
        title: isEditing ? "Actualizado" : "Creado",
        text: isEditing
          ? "Datos modificados correctamente"
          : "Usuario registrado correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      setModal(false);
      cargar();

    } catch (err) {
      console.error("ERROR HTTP REAL:", err);

      const data = err.response?.data;

      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);

        const mensaje = Object.values(data.fieldErrors)[0];

        Swal.fire({
          icon: "error",
          title: "Error",
          text: mensaje,
          confirmButtonText: "Aceptar",
        });

        return;
      }

      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: data?.message || "No se pudo procesar la solicitud",
        confirmButtonText: "Aceptar",
      });
    }
  };

  // ============================
  // ELIMINAR / PASSWORD
  // ============================
  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "El backend determinará si se elimina físicamente o se desactiva.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, proceder"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/usuarios/${id}`);
        Swal.fire("Procesado", "Acción realizada correctamente.", "success");
        cargar();
      } catch (err) {
        const msg = err.response?.data?.message || "No se pudo eliminar el usuario";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  const cambiarPassword = async () => {
    if (!currentPass.trim() || !newPass.trim()) {
      return Swal.fire("Error", "Ambas contraseñas son obligatorias", "warning");
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(newPass)) {
      return Swal.fire("Error", "La nueva contraseña no cumple los requisitos de seguridad", "warning");
    }

    try {
      await api.put(`/admin/usuarios/${passId}/cambiar-contrasena`, {
        contrasenaActual: currentPass,
        nuevaContrasena: newPass
      });

      Swal.fire("Éxito", "Contraseña actualizada correctamente", "success");
      setModalPass(false);
      setNewPass("");
      setCurrentPass("");

    } catch (err) {
      const data = err.response?.data;

      if (data?.fieldErrors) {
        const campo = Object.keys(data.fieldErrors)[0];
        const mensaje = data.fieldErrors[campo];

        return Swal.fire("Error", mensaje, "error");
      }

      Swal.fire("Error", data?.message || "No se pudo cambiar la contraseña", "error");
    }
  };

  // ============================
  // RENDER UI (Sin cambios visuales)
  // ============================
  return (
    <div className="container-fluid">
      
      {/* HEADER & TOOLBAR */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaUserShield className="me-2 text-primary" />
            Administración de Usuarios
          </h2>
          <p className="text-muted mb-0">Gestiona accesos, roles y estados de la plataforma.</p>
        </div>
        
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={abrirCrear}>
          <FaUserPlus /> Nuevo Usuario
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-0"><FaSearch className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control border-0" 
              placeholder="Buscar por nombre, correo, rol..." 
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Usuario</th>
                  <th>Dni</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
                ) : usuarios.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron usuarios.</td></tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.idUsuario}>
                      {/* COLUMNA USUARIO */}
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 fw-bold shadow-sm" 
                               style={{width: '40px', height: '40px', fontSize: '0.9rem'}}>
                            {u.nombres?.charAt(0)}{u.apellidos?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{u.nombres} {u.apellidos}</div>
                            <small className="text-muted">ID: {u.idUsuario}</small>
                          </div>
                        </div>
                      </td>
                      {/* COLUMNA dni*/}
                      <td>
                        <div className="d-flex flex-column small">
                          <span className="text-secondary"><FaEnvelope className="me-1"/> {u.dni}</span>
                        </div>
                      </td>

                      {/* COLUMNA CONTACTO */}
                      <td>
                        <div className="d-flex flex-column small">
                          <span className="text-secondary"><FaEnvelope className="me-1"/> {u.correo}</span>
                          {u.telefono && <span className="text-muted"><FaPhone className="me-1"/> {u.telefono}</span>}
                        </div>
                      </td>

                      {/* COLUMNA ROL */}
                      <td>
                        <span className={`badge rounded-pill border ${
                          (u.roles || []).includes("ADMINISTRADOR") ? "bg-dark text-white border-dark" :
                          (u.roles || []).includes("JUEZ") ? "bg-info-subtle text-info-emphasis border-info" :
                          "bg-light text-secondary border-secondary"
                        }`}>
                          {(u.roles || []).join(', ')}
                        </span>
                      </td>

                      {/* COLUMNA ESTADO */}
                      <td>
                          <span className={`badge ${
                           u.estado === "ACTIVO" ? "bg-success-subtle text-success" :
                           u.estado === "PENDIENTE" ? "bg-warning-subtle text-warning-emphasis" :
                           "bg-danger-subtle text-danger"
                          }`}>
                            {u.estado}
                          </span>
                      </td>

                      {/* COLUMNA ACCIONES */}
                      <td className="text-end pe-4">
                        <div className="btn-group">
                          <button className="btn btn-outline-secondary btn-sm" title="Cambiar Contraseña" 
                                  onClick={() => { setPassId(u.idUsuario); setNewPass(""); setModalPass(true); }}>
                            <FaKey />
                          </button>
                          <button className="btn btn-outline-primary btn-sm" title="Editar" 
                                  onClick={() => abrirEditar(u)}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-outline-danger btn-sm" title="Eliminar" 
                                  onClick={() => eliminar(u.idUsuario)}>
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

      {!loading && totalUsuarios > 0 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div className="text-muted small">
            Mostrando {usuarios.length} de {totalUsuarios} usuarios
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

      {/* --- MODAL CREAR / EDITAR --- */}
      {modal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small fw-bold">DNI *</label>
                    <input
                      className="form-control"
                      value={form.dni}
                      onChange={e => setForm({ ...form, dni: e.target.value })}
                      placeholder="Documento de identidad"
                    />
                    <button
                      className="btn btn-outline-info"
                      onClick={cargarPorDni}
                    >
                      Cargar
                    </button>
                    
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Nombres *</label>
                    <input className="form-control" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Apellidos *</label>
                    <input className="form-control" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Correo Electrónico *</label>
                    <input
                      type="email"
                      className={`form-control ${hasError("correo") ? "is-invalid" : ""}`}
                      value={form.correo}
                      onChange={e => handleChange("correo", e.target.value)}
                    />
                    {hasError("correo") && (
                      <div className="invalid-feedback">
                        {fieldErrors.correo}
                      </div>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Teléfono</label>
                    <input
                      className={`form-control ${hasError("telefono") ? "is-invalid" : ""}`}
                      value={form.telefono}
                      onChange={e => handleChange("telefono", e.target.value)}
                    />
                    {hasError("telefono") && (
                      <div className="invalid-feedback">
                        {fieldErrors.telefono}
                      </div>
                    )}
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Roles *</label>
                    <input
                      className="form-control"
                      value={isEditing ? (form.roles || []).join(", ") || "Sin rol" : ADMIN_ROLE}
                      disabled
                    />
                  </div>
                  
                  {!isEditing && (
                    <div className="input-group">
                      <input
                        type={showNewPass ? "text" : "password"}
                        className={`form-control ${hasError("contrasena") ? "is-invalid" : ""}`}
                        value={form.contrasena}
                        onChange={e => handleChange("contrasena", e.target.value)}
                        placeholder="Contraseña inicial"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPass(!showNewPass)}
                      >
                        {showNewPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {hasError("contrasena") && (
                        <div className="invalid-feedback">{fieldErrors.contrasena}</div>
                      )}
                    </div>
                  )}

                  <div className="col-12 mt-3">
                    <label className="form-label small fw-bold">Estado de la cuenta</label>
                    <select className="form-select" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button className="btn btn-primary px-4" onClick={guardar}>{isEditing ? "Guardar Cambios" : "Crear Usuario"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CAMBIAR PASSWORD --- */}
      {modalPass && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h6 className="modal-title fw-bold"><FaKey className="me-2"/>Cambiar Contraseña</h6>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setPassId(null); 
                    setNewPass(""); 
                    setCurrentPass("");
                    setModalPass(false);
                    setFieldErrors(prev => ({ ...prev, newPass: undefined })); // reset error
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <input 
                  type="password" 
                  className="form-control mb-2 text-center" 
                  placeholder="Contraseña actual"
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)} 
                />

                <div className="input-group">
                  <input
                    type={showNewPass ? "text" : "password"}
                    className={`form-control text-center ${hasError("newPass") ? "is-invalid" : ""}`}
                    placeholder="Nueva contraseña"
                    value={newPass}
                    onChange={e => {
                      setNewPass(e.target.value);
                      // Validación en tiempo real
                      if (!passwordRegex.test(e.target.value)) {
                        setFieldErrors(prev => ({
                          ...prev,
                          newPass: "Debe tener 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial"
                        }));
                      } else {
                        setFieldErrors(prev => ({ ...prev, newPass: undefined }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {hasError("newPass") && (
                    <div className="invalid-feedback">{fieldErrors.newPass}</div>
                  )}
                </div>

                <div className="form-text text-center small mt-1">
                  El backend validará la seguridad
                </div>
              </div>
              <div className="modal-footer justify-content-center bg-light">
                <button className="btn btn-dark w-100" onClick={cambiarPassword}>Actualizar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
