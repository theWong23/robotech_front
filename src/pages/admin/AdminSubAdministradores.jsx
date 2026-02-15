import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import { FaPlus, FaPowerOff, FaEdit, FaUserShield, FaSearch, FaEnvelope, FaPhone } from "react-icons/fa";
import { consultarDni } from "../../services/dniService";

export default function SubAdministradores() {
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({ nombre: "", dni: "", estado: "" });
  const [filtrosAplicados, setFiltrosAplicados] = useState({ nombre: "", dni: "", estado: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubadmins, setTotalSubadmins] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  const initialForm = {
    dni: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: ""
  };

  const [form, setForm] = useState(initialForm);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const hasError = (field) => Boolean(fieldErrors[field]);

  const validarCorreo = (value) => {
    if (!value?.trim()) return "El correo es obligatorio";
    if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(value.trim())) {
      return "Formato de correo inválido";
    }
    return null;
  };

  const handleFieldChange = (k, v) => {
    setField(k, v);
    if (k === "correo") {
      setFieldErrors((prev) => ({ ...prev, correo: validarCorreo(v) }));
    }
  };

  const cargarSubadmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/subadmins", {
        params: {
          page: page - 1,
          size: 20,
          nombre: filtrosAplicados.nombre || undefined,
          dni: filtrosAplicados.dni || undefined,
          estado: filtrosAplicados.estado || undefined
        }
      });
      setSubadmins(res.data?.content || []);
      setTotalPages(res.data?.totalPages ?? 1);
      setTotalSubadmins(res.data?.totalElements ?? 0);
    } catch {
      Swal.fire("Error", "No se pudo cargar subadministradores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSubadmins();
  }, [page, filtrosAplicados.nombre, filtrosAplicados.dni, filtrosAplicados.estado]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [page, totalPages]);

  const aplicarBusqueda = () => {
    const next = {
      nombre: filtros.nombre.trim(),
      dni: filtros.dni.trim(),
      estado: filtros.estado.trim()
    };
    if (
      next.nombre === filtrosAplicados.nombre &&
      next.dni === filtrosAplicados.dni &&
      next.estado === filtrosAplicados.estado
    ) return;
    setPage(1);
    setFiltrosAplicados(next);
  };

  const limpiarBusqueda = () => {
    if (!filtros.nombre && !filtros.dni && !filtros.estado
      && !filtrosAplicados.nombre && !filtrosAplicados.dni && !filtrosAplicados.estado) return;
    setFiltros({ nombre: "", dni: "", estado: "" });
    setPage(1);
    setFiltrosAplicados({ nombre: "", dni: "", estado: "" });
  };

  const cargarPorDni = async () => {
    try {
      Swal.fire({
        title: "Consultando DNI...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const data = await consultarDni(form.dni);

      setForm((prev) => ({
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
    const vacios = required.filter((k) => !form[k]);

    if (vacios.length) {
      return Swal.fire("Campos incompletos", "Completa todos los campos", "warning");
    }

    const correoError = validarCorreo(form.correo);
    if (correoError) {
      setFieldErrors((prev) => ({ ...prev, correo: correoError }));
      return Swal.fire("Error", correoError, "warning");
    }

    try {
      await api.post("/admin/subadmins", form);
      Swal.fire("Éxito", "Subadministrador creado", "success");
      cerrarModal();
      cargarSubadmins();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.mensaje || err.response?.data || "Error al crear";
      Swal.fire("Error", msg, "error");
    }
  };

  const editarSubadmin = async () => {
    const correoError = validarCorreo(form.correo);
    if (correoError) {
      setFieldErrors((prev) => ({ ...prev, correo: correoError }));
      return Swal.fire("Error", correoError, "warning");
    }

    try {
      await api.put(`/admin/subadmins/${editando.idSubadmin}`, {
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono,
        correo: form.correo
      });

      Swal.fire("Actualizado", "Subadministrador actualizado", "success");
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
      text: `Pasará a ${nuevoEstado}`,
      showCancelButton: true,
      confirmButtonText: "Sí"
    });

    if (!ok.isConfirmed) return;

    try {
      await api.put(`/admin/subadmins/${sub.idSubadmin}/estado`, { estado: nuevoEstado });
      cargarSubadmins();
    } catch {
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }
  };

  const abrirEditar = (s) => {
    setEditando(s);
    setFieldErrors({});
    setForm({
      dni: s.dni || "",
      correo: s.correo || "",
      contrasena: "",
      nombres: s.nombres,
      apellidos: s.apellidos,
      telefono: s.telefono || ""
    });
    setModalOpen(true);
  };

  const abrirCrear = () => {
    setEditando(null);
    setFieldErrors({});
    setForm(initialForm);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    setFieldErrors({});
    setForm(initialForm);
  };

  return (
    <div className="container-fluid px-4 py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaUserShield className="me-2 text-primary" />
            Gestión de Subadministradores
          </h2>
          <p className="text-muted mb-0">Administra cuentas subadmin y su estado de acceso.</p>
        </div>

        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={abrirCrear}>
          <FaPlus /> Nuevo Subadmin
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-2">
          <div className="row g-2 align-items-end mb-2">
            <div className="col-12 col-md-5">
              <label className="form-label small fw-bold mb-1">Nombre</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombres o apellidos..."
                value={filtros.nombre}
                onChange={(e) => setFiltros(prev => ({ ...prev, nombre: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") aplicarBusqueda(); }}
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small fw-bold mb-1">DNI</label>
              <input
                type="text"
                className="form-control"
                placeholder="Documento..."
                value={filtros.dni}
                onChange={(e) => setFiltros(prev => ({ ...prev, dni: e.target.value.replace(/\D/g, "").slice(0, 8) }))}
                onKeyDown={(e) => { if (e.key === "Enter") aplicarBusqueda(); }}
              />
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label small fw-bold mb-1">Estado</label>
              <select
                className="form-select"
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button className="btn btn-primary mb-1" onClick={aplicarBusqueda}>
                <FaSearch className="me-1" /> Buscar
              </button>
              <button className="btn btn-outline-secondary" onClick={limpiarBusqueda}>
                Limpiar
              </button>
            </div>
          </div>
          <small className="text-muted px-2">Filtra por nombre, DNI o estado y presiona Enter o Buscar.</small>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Subadministrador</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                  </td>
                </tr>
              ) : subadmins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    No se encontraron subadministradores.
                  </td>
                </tr>
              ) : (
                subadmins.map((s) => (
                  <tr key={s.idSubadmin}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 fw-bold shadow-sm"
                          style={{ width: "40px", height: "40px", fontSize: "0.9rem" }}
                        >
                          {s.nombres?.charAt(0)}{s.apellidos?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{s.nombres} {s.apellidos}</div>
                          <small className="text-muted">ID: {s.idSubadmin}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column small">
                        <span className="text-secondary"><FaEnvelope className="me-1" /> {s.correo}</span>
                        <span className="text-muted"><FaPhone className="me-1" /> {s.telefono || "No registrado"}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.estado === "ACTIVO" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="btn-group border rounded-3 overflow-hidden shadow-sm bg-white">
                        <button className="btn btn-sm btn-white text-primary border-0 py-2" title="Editar" onClick={() => abrirEditar(s)}>
                          <FaEdit />
                        </button>
                        <button className="btn btn-sm btn-white text-danger border-0 py-2" title="Cambiar estado" onClick={() => cambiarEstado(s)}>
                          <FaPowerOff />
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

      {!loading && totalSubadmins > 0 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div className="text-muted small">Mostrando {subadmins.length} de {totalSubadmins} subadmins</div>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(1)} disabled={page <= 1}>Primero</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</button>
            <span className="btn btn-light btn-sm disabled">Página {page} de {totalPages}</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Siguiente</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Último</button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">{editando ? "Editar Subadmin" : "Nuevo Subadmin"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cerrarModal} />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-bold">DNI</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      placeholder="DNI"
                      value={form.dni}
                      onChange={(e) => setField("dni", e.target.value.replace(/\D/g, "").slice(0, 8))}
                      inputMode="numeric"
                      maxLength={8}
                      disabled={Boolean(editando)}
                    />
                    {!editando && (
                      <button type="button" className="btn btn-outline-info" onClick={cargarPorDni}>
                        Cargar
                      </button>
                    )}
                  </div>
                </div>

                {["nombres", "apellidos", "correo", "telefono", "contrasena"]
                  .filter((k) => !editando || k !== "contrasena")
                  .map((k) => {
                    const isTelefono = k === "telefono";
                    const labels = {
                      nombres: "Nombres",
                      apellidos: "Apellidos",
                      correo: "Correo",
                      telefono: "Teléfono",
                      contrasena: "Contraseña"
                    };

                    return (
                      <div className="mb-3" key={k}>
                        <label className="form-label small fw-bold">{labels[k]}</label>
                        <input
                          className={`form-control ${k === "correo" && hasError("correo") ? "is-invalid" : ""}`}
                          placeholder={labels[k]}
                          value={form[k]}
                          onChange={(e) =>
                            handleFieldChange(k, isTelefono ? e.target.value.replace(/\D/g, "").slice(0, 9) : e.target.value)
                          }
                          type={k === "contrasena" ? "password" : isTelefono ? "tel" : "text"}
                          inputMode={isTelefono ? "numeric" : undefined}
                          maxLength={isTelefono ? 9 : undefined}
                        />
                        {k === "correo" && hasError("correo") && (
                          <div className="invalid-feedback d-block">{fieldErrors.correo}</div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={cerrarModal}>Cancelar</button>
                <button className="btn btn-primary px-4" onClick={editando ? editarSubadmin : crearSubadmin}>
                  {editando ? "Guardar cambios" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
