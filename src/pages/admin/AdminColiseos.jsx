import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

export default function AdminColiseos() {

  const [coliseos, setColiseos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagen, setImagen] = useState(null);


  const [form, setForm] = useState({
    nombre: "",
    ubicacion: ""
  });

  // =========================
  // CARGAR LISTA
  // =========================
  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const res = await api.get("/api/admin/coliseos");
      setColiseos(res.data);
    } catch (err) {
      Swal.fire("Error", "No se pudo cargar coliseos", "error");
    }
  };

  // =========================
  // ABRIR MODAL
  // =========================
  const abrirCrear = () => {
    setForm({ nombre: "", ubicacion: "" });
    setImagen(null);        // 🔥 reset imagen
    setEditingId(null);
    setModal(true);
  };

  // =========================
  // GUARDAR
  // =========================
 const guardar = async () => {

  if (!form.nombre.trim() || !form.ubicacion.trim()) {
    Swal.fire("Campos requeridos", "Completa todos los campos", "warning");
    return;
  }

  try {
    let res;

    // 1️⃣ CREAR O EDITAR COLISEO
    if (!editingId) {
      res = await api.post("/api/admin/coliseos", form);
      Swal.fire("✔ Coliseo creado", "", "success");
    } else {
      res = await api.put(`/api/admin/coliseos/${editingId}`, form);
      Swal.fire("✔ Coliseo actualizado", "", "success");
    }

    const idColiseo = res.data.idColiseo;

    // 2️⃣ SUBIR IMAGEN (SI EXISTE)
    if (imagen) {
      const data = new FormData();
      data.append("file", imagen);

      await api.post(
        `/api/admin/coliseos/${idColiseo}/imagen`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    }

    setModal(false);
    setImagen(null);
    cargar();

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo guardar", "error");
  }
};


  // =========================
  // ELIMINAR
  // =========================
  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar coliseo?",
      text: "Esta acción es irreversible",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/api/admin/coliseos/${id}`);
      Swal.fire("Coliseo eliminado", "", "success");
      cargar();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="container mt-4">

      <h2 className="fw-bold mb-3">Gestión de Coliseos</h2>

      <button className="btn btn-primary my-3" onClick={abrirCrear}>
        ➕ Crear Coliseo
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {coliseos.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No hay coliseos registrados
              </td>
            </tr>
          ) : coliseos.map(c => (
            <tr key={c.idColiseo}>
              <td>{c.idColiseo}</td>
              <td>{c.nombre}</td>
              <td>{c.ubicacion}</td>
              <td>
                {c.imagenUrl ? (
                    <>
                    <img
                        src={`http://localhost:8080${c.imagenUrl}`}
                        width="40"
                        style={{ borderRadius: "6px", display: "block", marginBottom: "4px" }}
                    />
                    <small className="text-muted">{c.imagenUrl}</small>
                    </>
                ) : (
                    <span className="text-muted">Sin imagen</span>
                )}
                </td>





              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => {
                    setEditingId(c.idColiseo);
                    setForm({
                      nombre: c.nombre,
                      ubicacion: c.ubicacion
                    });
                    setModal(true);
                  }}
                >
                  Editar
                </button>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => eliminar(c.idColiseo)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* =========================
          MODAL
      ========================= */}
      {modal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">

              <h4>{editingId ? "Editar Coliseo" : "Crear Coliseo"}</h4>

              <label className="mt-2">Nombre</label>
              <input
                className="form-control"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />

              <label className="mt-2">Ubicación</label>
              <input
                className="form-control"
                value={form.ubicacion}
                onChange={e => setForm({ ...form, ubicacion: e.target.value })}
              />

              <label className="mt-2">Imagen</label>
                <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={e => setImagen(e.target.files[0])}
                />


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
