import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";

export default function AdminTorneos() {

  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
  //   CARGAR TORNEOS
  // =============================
  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      // ⚠️ CORREGIDO: Se quitó "/api"
      const res = await api.get("/admin/torneos");
      setTorneos(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los torneos");
      setTorneos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // =============================
  //   CAMBIAR ESTADO
  // =============================
  const cambiarEstado = async (idTorneo, nuevoEstado) => {
    try {
      // ⚠️ CORREGIDO: Se quitó "/api"
      await api.put(`/admin/torneos/${idTorneo}/estado`, {
        estado: nuevoEstado
      });

      Swal.fire("✔ Estado actualizado", "", "success");
      cargar();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }
  };

  // =============================
  //   GUARDAR TORNEO
  // =============================
  const guardar = async () => {
    try {
      if (!editingId) {
        // ⚠️ CORREGIDO: Se quitó "/api"
        await api.post("/admin/torneos", form);
        Swal.fire("✔ Torneo creado", "", "success");
      } else {
        // ⚠️ CORREGIDO: Se quitó "/api"
        await api.put(`/admin/torneos/${editingId}`, form);
        Swal.fire("✔ Torneo actualizado", "", "success");
      }

      setModal(false);
      cargar();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar el torneo", "error");
    }
  };

  // =============================
  //   ELIMINAR TORNEO
  // =============================
  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar torneo?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      // ⚠️ CORREGIDO: Se quitó "/api"
      await api.delete(`/admin/torneos/${id}`);
      Swal.fire("✔ Eliminado", "", "success");
      cargar();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo eliminar el torneo", "error");
    }
  };

  const f = (fecha) =>
    fecha ? new Date(fecha).toLocaleString() : "—";

  const gestionarCategorias = (id) => {
    // Esto es una ruta de React Router (Frontend), así que está bien sin cambios
    // Sugerencia: Usar navigate() de react-router-dom es mejor que window.location.href para SPAs
    window.location.href = `/admin/torneos/${id}/categorias`;
  };

  // =============================
  //   RENDER DEFENSIVO
  // =============================
  if (loading) {
    return <h3 className="text-center mt-4">Cargando torneos...</h3>;
  }

  if (error) {
    return <h3 className="text-center text-danger">{error}</h3>;
  }

  // =============================
  //   UI
  // =============================
  return (
    <div className="container mt-4">

      <h2 className="fw-bold">Gestión de Torneos</h2>

      <button
        className="btn btn-primary my-3"
        onClick={() => {
          setForm({
            nombre: "",
            descripcion: "",
            fechaInicio: "",
            fechaFin: "",
            fechaAperturaInscripcion: "",
            fechaCierreInscripcion: "",
            estado: "BORRADOR",
          });
          setEditingId(null);
          setModal(true);
        }}
      >
        ➕ Crear torneo
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Inscripción</th>
            <th>Estado</th>
            <th>Categorías</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {torneos.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No hay torneos registrados
              </td>
            </tr>
          ) : (
            torneos.map(t => (
              <tr key={t.idTorneo}>
                <td>{t.nombre}</td>
                <td>{f(t.fechaInicio)}</td>
                <td>{f(t.fechaFin)}</td>
                <td>
                  {f(t.fechaAperturaInscripcion)} <br />
                  → {f(t.fechaCierreInscripcion)}
                </td>

                <td>
                  <select
                    className="form-control"
                    value={t.estado}
                    disabled={t.estado === "FINALIZADO"}
                    onChange={e =>
                      cambiarEstado(t.idTorneo, e.target.value)
                    }
                  >
                    <option value="BORRADOR">BORRADOR</option>
                    <option value="INSCRIPCIONES_ABIERTAS">INSCRIPCIONES_ABIERTAS</option>
                    <option value="INSCRIPCIONES_CERRADAS">INSCRIPCIONES_CERRADAS</option>
                    <option value="EN_PROGRESO">EN_PROGRESO</option>
                    <option value="FINALIZADO">FINALIZADO</option>
                  </select>
                </td>

                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => gestionarCategorias(t.idTorneo)}
                  >
                    Categorías
                  </button>
                </td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => {
                      setEditingId(t.idTorneo);
                      setForm(t);
                      setModal(true);
                    }}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminar(t.idTorneo)}
                  >
                    Eliminar
                  </button>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= MODAL ================= */}
      {modal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.4)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">

              <h4>{editingId ? "Editar Torneo" : "Crear Torneo"}</h4>

              {[
                ["Nombre", "nombre"],
                ["Descripción", "descripcion"]
              ].map(([label, key]) => (
                <input
                  key={key}
                  className="form-control mt-2"
                  placeholder={label}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                />
              ))}

              {[
                ["Inicio", "fechaInicio"],
                ["Fin", "fechaFin"],
                ["Apertura inscripción", "fechaAperturaInscripcion"],
                ["Cierre inscripción", "fechaCierreInscripcion"],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="mt-3 fw-bold">{label}</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}

              <label className="mt-3 fw-bold">Estado</label>
              <select
                className="form-control"
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value })}
              >
                <option value="BORRADOR">BORRADOR</option>
                <option value="INSCRIPCIONES_ABIERTAS">INSCRIPCIONES_ABIERTAS</option>
                <option value="INSCRIPCIONES_CERRADAS">INSCRIPCIONES_CERRADAS</option>
                <option value="EN_PROGRESO">EN_PROGRESO</option>
                <option value="FINALIZADO">FINALIZADO</option>
              </select>

              <div className="mt-3 d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={guardar}>
                  Guardar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}