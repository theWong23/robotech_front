import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig"; // ajusta la ruta

const CATEGORIAS_ROBOT = [
  { value: "MINISUMO", label: "MINISUMO" },
  { value: "MICROSUMO", label: "MICROSUMO" },
  { value: "MEGASUMO", label: "MEGASUMO" },
  { value: "DRONE", label: "DRONE" },
  { value: "FOLLOWER", label: "FOLLOWER" }
];

export default function AdminCategoriasTorneo() {
  
  const { idTorneo } = useParams();

  const [torneo, setTorneo] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    categoria: "",
    descripcion: "",
    modalidad: "INDIVIDUAL",
    maxParticipantes: 2,
    maxEquipos: null,
    maxIntegrantesEquipo: null
  });

  // ==================================================
  // CARGAR TORNEO + CATEGORÍAS
  // ==================================================
  const cargar = async () => {
    try {
      const torneoRes = await api.get(
        `http://localhost:8080/api/admin/torneos/${idTorneo}`
      );

      const categoriasRes = await api.get(
        `http://localhost:8080/api/admin/categorias-torneo/${idTorneo}`
      );

      setTorneo(torneoRes.data);
      setCategorias(Array.isArray(categoriasRes.data) ? categoriasRes.data : []);

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar la información", "error");
      setCategorias([]);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // ==================================================
  // MODAL
  // ==================================================
  const abrirCrear = () => {
    setForm({
      categoria: "",
      descripcion: "",
      modalidad: "INDIVIDUAL",
      maxParticipantes: 2,
      maxEquipos: null,
      maxIntegrantesEquipo: null
    });
    setEditingId(null);
    setModal(true);
  };

  // ==================================================
  // GUARDAR
  // ==================================================
  const guardar = async () => {
    try {
      if (!editingId && categorias.some(c => c.categoria === form.categoria)) {
          Swal.fire(
            "Categoría duplicada",
            "Esta categoría ya existe en el torneo",
            "warning"
          );
          return;
        }
      const payload =
        form.modalidad === "INDIVIDUAL"
          ? {
              categoria: form.categoria,
              descripcion: form.descripcion,
              modalidad: "INDIVIDUAL",
              maxParticipantes: form.maxParticipantes
            }
          : {
              categoria: form.categoria,
              descripcion: form.descripcion,
              modalidad: "EQUIPO",
              maxEquipos: form.maxEquipos,
              maxIntegrantesEquipo: form.maxIntegrantesEquipo
            };

      if (!editingId) {
        await api.post(
          `http://localhost:8080/api/admin/categorias-torneo/${idTorneo}`,
          payload
        );
        Swal.fire("✔ Categoría creada", "", "success");
      } else {
        await api.put(
          `http://localhost:8080/api/admin/categorias-torneo/${editingId}`,
          payload
        );
        Swal.fire("✔ Categoría actualizada", "", "success");
      }

      setModal(false);
      cargar();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar la categoría", "error");
    }
  };

  // ==================================================
  // ELIMINAR
  // ==================================================
  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar categoría?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(
        `http://localhost:8080/api/admin/categorias-torneo/${id}`
      );
      Swal.fire("Eliminado", "", "success");
      cargar();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <div className="container mt-4">

      <h2 className="fw-bold">Categorías del Torneo</h2>

      {torneo && (
        <p className="text-muted">
          Torneo: <strong>{torneo.nombre}</strong>
        </p>
      )}

      <button className="btn btn-primary my-3" onClick={abrirCrear}>
        ➕ Crear Categoría
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Modalidad</th>
            <th>Cupos / Equipos</th>
            <th>Integrantes</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {categorias.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">No hay categorías</td>
            </tr>
          ) : (
            categorias.map(c => (
              <tr key={c.idCategoriaTorneo}>
                <td>
                  <span className="badge bg-info text-dark px-3 py-2">
                    {c.categoria}
                  </span>
                </td>
                <td>{c.modalidad}</td>

                <td>
                  {c.modalidad === "INDIVIDUAL"
                    ? c.maxParticipantes
                    : c.maxEquipos}
                </td>

                <td>
                  {c.modalidad === "EQUIPO"
                    ? c.maxIntegrantesEquipo
                    : "—"}
                </td>

                <td>{c.descripcion}</td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => {
                      setEditingId(c.idCategoriaTorneo);
                      setForm({
                        categoria: c.categoria,
                        descripcion: c.descripcion,
                        modalidad: c.modalidad,
                        maxParticipantes: c.maxParticipantes,
                        maxEquipos: c.maxEquipos,
                        maxIntegrantesEquipo: c.maxIntegrantesEquipo
                      });
                      setModal(true);
                    }}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminar(c.idCategoriaTorneo)}
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
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">

              <h4>{editingId ? "Editar Categoría" : "Crear Categoría"}</h4>

              <label className="mt-2 fw-bold">Categoría</label>
                <select
                  className="form-control"
                  value={form.categoria}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                >
                  <option value="">Seleccione categoría</option>

                  {CATEGORIAS_ROBOT.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>

              <textarea
                className="form-control mt-2"
                placeholder="Descripción"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
              />

              <label className="mt-3 fw-bold">Modalidad</label>
              <select
                className="form-control"
                value={form.modalidad}
                onChange={e => {
                  const modalidad = e.target.value;
                  setForm({
                    ...form,
                    modalidad,
                    maxParticipantes: modalidad === "INDIVIDUAL" ? 1 : null,
                    maxEquipos: modalidad === "EQUIPO" ? 2 : null,
                    maxIntegrantesEquipo: modalidad === "EQUIPO" ? 2 : null
                  });
                }}
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="EQUIPO">Equipo</option>
              </select>

              {form.modalidad === "INDIVIDUAL" && (
                <>
                  <label className="mt-2 fw-bold">Cupos</label>
                  <input
                    type="number"
                    min="2"
                    className="form-control"
                    value={form.maxParticipantes}
                    onChange={e =>
                      setForm({ ...form, maxParticipantes: Number(e.target.value) })
                    }
                  />
                </>
              )}

              {form.modalidad === "EQUIPO" && (
                <>
                  <label className="mt-2 fw-bold">Máx equipos</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.maxEquipos}
                    onChange={e =>
                      setForm({ ...form, maxEquipos: Number(e.target.value) })
                    }
                  />

                  <label className="mt-2 fw-bold">Integrantes por equipo</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.maxIntegrantesEquipo}
                    onChange={e =>
                      setForm({ ...form, maxIntegrantesEquipo: Number(e.target.value) })
                    }
                  />
                </>
              )}

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
