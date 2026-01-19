import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import { FaPlus, FaPowerOff, FaEdit } from "react-icons/fa";
import { consultarDni } from "../../services/dniService";


export default function SubAdministradores() {

  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const initialForm = {
    dni: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: ""
  };

  const [form, setForm] = useState(initialForm);

  const setField = (k, v) =>
    setForm(prev => ({ ...prev, [k]: v }));

  // =========================
  // LISTAR
  // =========================
  const cargarSubadmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/subadmins");
      setSubadmins(res.data || []);
    } catch {
      Swal.fire("Error", "No se pudo cargar subadministradores", "error");
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    cargarSubadmins();
  }, []);

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

  

  // =========================
  // CREAR
  // =========================
  const crearSubadmin = async () => {
    const required = ["dni", "nombres", "apellidos", "correo", "telefono", "contrasena"];
    const vacios = required.filter(k => !form[k]);

    if (vacios.length) {
      return Swal.fire("Campos incompletos", "Completa todos los campos", "warning");
    }

    try {
      await api.post("/admin/subadmins", form);
      Swal.fire("Éxito", "Subadministrador creado", "success");
      cerrarModal();
      cargarSubadmins();
    } catch (err) {
      Swal.fire("Error", err.response?.data || "Error al crear", "error");
    }
  };

  // =========================
  // EDITAR
  // =========================
  const editarSubadmin = async () => {
    try {
      await api.put(`/admin/subadmins/${editando.idSubadmin}`, {
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono
      });

      Swal.fire("Actualizado", "Subadministrador actualizado", "success");
      cerrarModal();
      cargarSubadmins();
    } catch {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  // =========================
  // CAMBIAR ESTADO
  // =========================
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
      await api.put(
        `/admin/subadmins/${sub.idSubadmin}/estado`,
        { estado: nuevoEstado }
      );
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

  // =========================
  // UI
  // =========================
  return (
    <div className="container-fluid px-4 mt-4">

      <div className="d-flex justify-content-between mb-3">
        <h3>Gestión de Subadministradores</h3>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <FaPlus /> Nuevo Subadmin
        </button>
      </div>

      <table className="table table-dark table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5">Cargando...</td></tr>
          ) : subadmins.map(s => (
            <tr key={s.idSubadmin}>
              <td>{s.nombres} {s.apellidos}</td>
              <td>{s.correo}</td>
              <td>{s.telefono || "—"}</td>
              <td>
                <span className={`badge ${s.estado === "ACTIVO" ? "bg-success" : "bg-danger"}`}>
                  {s.estado}
                </span>
              </td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => {
                    setEditando(s);
                    setForm({
                      dni: "",
                      correo: "",
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
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => cambiarEstado(s)}
                >
                  <FaPowerOff />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editando ? "Editar Subadmin" : "Nuevo Subadmin"}</h5>
                <button className="btn-close" onClick={cerrarModal} />
              </div>

              <div className="modal-body">

                {/* DNI + BOTÓN CARGAR (solo al crear) */}
                {!editando && (
                  <div className="mb-3">
                    <label className="form-label">DNI</label>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        placeholder="DNI"
                        value={form.dni}
                        onChange={e => setField("dni", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={cargarPorDni}
                      >
                        Cargar
                      </button>
                    </div>
                  </div>
                )}

                {/* RESTO DE CAMPOS */}
                {["nombres", "apellidos", "correo", "telefono", "contrasena"]
                  .filter(k => !editando || !["correo", "contrasena"].includes(k))
                  .map(k => (
                    <input
                      key={k}
                      className="form-control mb-2"
                      placeholder={k}
                      value={form[k]}
                      onChange={e => setField(k, e.target.value)}
                      type={k === "contrasena" ? "password" : "text"}
                    />
                  ))}

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button
                  className="btn btn-success"
                  onClick={editando ? editarSubadmin : crearSubadmin}
                >
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
