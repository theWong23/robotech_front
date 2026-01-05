import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

export default function Clubes() {

  const [busqueda, setBusqueda] = useState("");
  const [clubes, setClubes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    correoContacto: "",
    telefonoContacto: "",
    direccionFiscal: "",
    correoPropietario: "",
    telefonoPropietario: "",
    contrasenaPropietario: ""
  });

  const [modalOpen, setModalOpen] = useState(false);

  // =========================
  // CARGAR CLUBES
  // =========================
  useEffect(() => {
    cargarClubes();
  }, [busqueda]);

  const cargarClubes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/clubes", {
        params: { nombre: busqueda }
      });
      setClubes(res.data);
    } catch (err) {
      Swal.fire("Error", "No se pudo cargar los clubes", "error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ABRIR MODAL CREAR
  // =========================
  const abrirModal = () => {
    setForm({
      nombre: "",
      correoContacto: "",
      telefonoContacto: "",
      direccionFiscal: "",
      correoPropietario: "",
      telefonoPropietario: "",
      contrasenaPropietario: ""
    });
    setModalOpen(true);
  };

  // =========================
  // CREAR CLUB
  // =========================
  const crearClub = async () => {
    try {
      await api.post("/api/admin/clubes", form);

      Swal.fire("✔ Club creado", "El club fue registrado correctamente", "success");
      setModalOpen(false);
      cargarClubes();

    } catch (err) {
      Swal.fire("Error", "No se pudo crear el club", "error");
    }
  };

  // =========================
  // GUARDAR EDICIÓN
  // =========================
  const guardarClub = async () => {
    try {
      await api.put(`/api/admin/clubes/${editando.idClub}`, editando);

      Swal.fire("✔ Club actualizado", "", "success");
      setEditando(null);
      cargarClubes();

    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  // =========================
  // ELIMINAR CLUB
  // =========================
  const eliminarClub = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar club?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      confirmButtonText: "Eliminar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/api/admin/clubes/${id}`);
      Swal.fire("Eliminado", "El club ha sido eliminado", "success");
      cargarClubes();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="p-4">

      <h2 className="fw-bold mb-3">Gestión de Clubes</h2>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        className="form-control mb-3"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <button className="btn btn-primary mb-4" onClick={abrirModal}>
        ➕ Crear Nuevo Club
      </button>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan="5">Cargando...</td></tr>
          ) : clubes.length === 0 ? (
            <tr><td colSpan="5">No se encontraron clubes</td></tr>
          ) : clubes.map(c => (
            <tr key={c.idClub}>
              <td>{c.nombre}</td>
              <td>{c.correoContacto}</td>
              <td>{c.telefonoContacto}</td>
              <td>
                <span className={`badge bg-${c.estado === "ACTIVO" ? "success" : "secondary"}`}>
                  {c.estado}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => setEditando({ ...c })}
                >
                  Editar
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => eliminarClub(c.idClub)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL CREAR */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">

              <h4 className="fw-bold">Registrar Nuevo Club</h4>

              {Object.keys(form).map((k) => (
                <input
                  key={k}
                  type={k.includes("contrasena") ? "password" : "text"}
                  className="form-control mt-2"
                  placeholder={k}
                  value={form[k]}
                  onChange={e => setForm({ ...form, [k]: e.target.value })}
                />
              ))}

              <div className="mt-3 d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cerrar</button>
                <button className="btn btn-success" onClick={crearClub}>Guardar</button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {editando && (
        <div className="modal d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Editar Club</h5>
                <button className="btn-close" onClick={() => setEditando(null)} />
              </div>

              <div className="modal-body">

                <input className="form-control mb-2"
                  value={editando.nombre}
                  onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                />

                <input className="form-control mb-2"
                  value={editando.correoContacto}
                  onChange={(e) => setEditando({ ...editando, correoContacto: e.target.value })}
                />

                <input className="form-control mb-2"
                  value={editando.telefonoContacto}
                  onChange={(e) => setEditando({ ...editando, telefonoContacto: e.target.value })}
                />

                <select
                  className="form-select"
                  value={editando.estado}
                  onChange={(e) => setEditando({ ...editando, estado: e.target.value })}
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>

              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={guardarClub}>Guardar</button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
