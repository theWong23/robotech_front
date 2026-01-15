import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig"; // 👈 ÚNICO CAMBIO: Corregido para que cargue

export default function Clubes() {

  const [busqueda, setBusqueda] = useState("");
  const [clubes, setClubes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    correoContacto: "",
    telefonoContacto: "",
    direccionFiscal: "",
    correoPropietario: "",
    telefonoPropietario: "",
    contrasenaPropietario: ""
  });

  // =====================================
  // CARGAR CLUBES
  // =====================================
  useEffect(() => {
    cargarClubes();
  }, [busqueda]);

  const cargarClubes = async () => {
    try {
      setLoading(true);
      // axiosConfig ya tiene /api, así que la ruta es /admin/clubes
      const res = await api.get("/admin/clubes", {
        params: { nombre: busqueda }
      });
      setClubes(res.data);
    } catch {
      Swal.fire("Error", "No se pudo cargar los clubes", "error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // MODAL CREAR
  // =====================================
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

  const crearClub = async () => {
    try {
      await api.post("/admin/clubes", form);
      Swal.fire("✔ Club creado", "El club fue registrado correctamente", "success");
      setModalOpen(false);
      cargarClubes();
    } catch (err) {
      Swal.fire("Error", err.response?.data || "No se pudo crear el club", "error");
    }
  };

  // =====================================
  // EDITAR CLUB
  // =====================================
  const guardarClub = async () => {
    try {
      await api.put(`/admin/clubes/${editando.idClub}`, editando);
      Swal.fire("✔ Club actualizado", "", "success");
      setEditando(null);
      cargarClubes();
    } catch {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  // =====================================
  // ACTIVAR / DESACTIVAR
  // =====================================
  const cambiarEstado = async (club) => {

    const nuevoEstado = club.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";

    const confirm = await Swal.fire({
      title: `${nuevoEstado === "ACTIVO" ? "Activar" : "Desactivar"} club`,
      text: `¿Seguro que deseas ${nuevoEstado.toLowerCase()} este club?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/admin/clubes/${club.idClub}`, {
        ...club,
        estado: nuevoEstado
      });

      Swal.fire("✔ Estado actualizado", "", "success");
      cargarClubes();
    } catch {
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
    }
  };

  // =====================================
  // RENDER
  // =====================================
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

      <button
        className="btn btn-primary mb-4"
        onClick={abrirModal}
        disabled={loading}
      >
        ➕ Crear Nuevo Club
      </button>

      <table className="table table-bordered align-middle">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th style={{ width: 220 }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
          ) : clubes.length === 0 ? (
            <tr><td colSpan="5" className="text-center">No se encontraron clubes</td></tr>
          ) : clubes.map(c => (
            <tr key={c.idClub}>
              <td>{c.nombre}</td>
              <td>{c.correoContacto}</td>
              <td>{c.telefonoContacto}</td>
              <td>
                <span className={`badge rounded-pill bg-${c.estado === "ACTIVO" ? "success" : "danger"}`}>
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
                  className={`btn btn-${c.estado === "ACTIVO" ? "danger" : "success"} btn-sm`}
                  onClick={() => cambiarEstado(c)}
                >
                  {c.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL CREAR ================= */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">

              <h4 className="fw-bold mb-3">Registrar Club</h4>

              <input className="form-control mb-2" placeholder="Nombre del club"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />

              <input className="form-control mb-2" placeholder="Correo de contacto"
                value={form.correoContacto}
                onChange={e => setForm({ ...form, correoContacto: e.target.value })}
              />

              <input className="form-control mb-2" placeholder="Teléfono de contacto"
                value={form.telefonoContacto}
                onChange={e => setForm({ ...form, telefonoContacto: e.target.value })}
              />

              <input
                className="form-control mb-2"
                placeholder="Dirección fiscal"
                value={form.direccionFiscal}
                onChange={e =>
                  setForm({ ...form, direccionFiscal: e.target.value })
                }
              />


              <hr />

              <input className="form-control mb-2" placeholder="Correo del propietario"
                value={form.correoPropietario}
                onChange={e => setForm({ ...form, correoPropietario: e.target.value })}
              />

              <input className="form-control mb-2" placeholder="Teléfono del propietario"
                value={form.telefonoPropietario}
                onChange={e => setForm({ ...form, telefonoPropietario: e.target.value })}
              />

              <input className="form-control mb-3" type="password" placeholder="Contraseña"
                value={form.contrasenaPropietario}
                onChange={e => setForm({ ...form, contrasenaPropietario: e.target.value })}
              />

              <div className="text-end">
                <button className="btn btn-secondary me-2" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={crearClub}>
                  Guardar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL EDITAR ================= */}
      {editando && (
        <div className="modal fade show d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">

              <h4 className="fw-bold mb-3">Editar Club</h4>

              <input className="form-control mb-2"
                value={editando.nombre}
                onChange={e => setEditando({ ...editando, nombre: e.target.value })}
              />

              <input className="form-control mb-2"
                value={editando.correoContacto}
                onChange={e => setEditando({ ...editando, correoContacto: e.target.value })}
              />

              <input className="form-control mb-2"
                value={editando.telefonoContacto}
                onChange={e => setEditando({ ...editando, telefonoContacto: e.target.value })}
              />

              <select
                className="form-select mb-3"
                value={editando.estado}
                onChange={e => setEditando({ ...editando, estado: e.target.value })}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>

              <div className="text-end">
                <button className="btn btn-secondary me-2" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={guardarClub}>
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