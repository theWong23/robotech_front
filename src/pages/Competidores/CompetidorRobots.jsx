import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig"; // Asegúrate de que esta ruta sea correcta

export default function CompetidorRobots() {

  const [robots, setRobots] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    nickname: "",
    categoria: "",
  });

  // =============================
  // AUTH (LECTURA SEGURA)
  // =============================
  const storedUser = localStorage.getItem("usuario");
  const usuario = storedUser ? JSON.parse(storedUser) : null;
  // Ajusta esto según cómo guardes el ID en tu login (idCompetidor o id dentro de usuario)
  const idCompetidor = usuario?.idCompetidor || usuario?.id; 

  // =============================
  // CARGAR ROBOTS
  // =============================
  const cargarRobots = async () => {
    if (!idCompetidor) return;
    try {
      // Ajusta la URL si tu endpoint es diferente
      const res = await api.get(`/competidor/robots/${idCompetidor}`);
      setRobots(res.data);
    } catch (error) {
      console.error(error);
      // No mostramos alerta aquí para no molestar al cargar la página si falla algo menor
    }
  };

  useEffect(() => {
    cargarRobots();
  }, [idCompetidor]);

  // =============================
  // ABRIR MODAL
  // =============================
  const abrirCrear = () => {
    setForm({ nombre: "", nickname: "", categoria: "" });
    setEditingId(null);
    setModal(true);
  };

  const abrirEditar = (robot) => {
    setEditingId(robot.idRobot);
    setForm({
      nombre: robot.nombre,
      nickname: robot.nickname,
      categoria: robot.categoria,
    });
    setModal(true);
  };

  // =============================
  // GUARDAR (CONECTADO AL VALIDATOR DEL BACKEND)
  // =============================
  const guardar = async () => {
    try {
      // 1. Enviamos los datos "crudos" al backend.
      // Si el nickname tiene groserías, el backend lanzará excepción (400 o 500).
      
      if (editingId) {
        // EDITAR
        await api.put(`/competidor/robots/${editingId}`, form);
        Swal.fire({ icon: "success", title: "Actualizado", text: "Robot actualizado correctamente", timer: 1500 });
      } else {
        // CREAR
        await api.post(`/competidor/robots/${idCompetidor}`, form);
        Swal.fire({ icon: "success", title: "Registrado", text: "Robot creado correctamente", timer: 1500 });
      }

      setModal(false);
      cargarRobots(); // Recargar la lista

    } catch (err) {
      console.error("Error al guardar:", err);

      // 2. 🛡️ CAPTURA DEL ERROR DEL NICKNAME VALIDATOR
      // Spring Boot suele devolver el mensaje en: err.response.data.message
      // O a veces directamente en err.response.data (dependiendo de tu configuración de errores global)
      
      const mensajeBackend = 
        err.response?.data?.message || // Estructura estándar Spring Boot
        err.response?.data ||          // Si devuelves ResponseEntity.body("Texto")
        "Ocurrió un error al guardar el robot.";

      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: mensajeBackend // Aquí saldrá: "El texto contiene palabras inapropiadas"
      });
    }
  };

  // =============================
  // ELIMINAR
  // =============================
  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar robot?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar"
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/competidor/robots/${id}`);
      Swal.fire("Eliminado", "", "success");
      cargarRobots();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar el robot", "error");
    }
  };

  // =============================
  // RENDER
  // =============================
  if (!idCompetidor) return <div className="alert alert-warning m-4">No se encontró información del competidor. Inicia sesión nuevamente.</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold text-primary">Mis Robots 🤖</h2>
        <button className="btn btn-success" onClick={abrirCrear}>
          ➕ Nuevo Robot
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Nickname</th>
                <th>Categoría</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {robots.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No tienes robots registrados aún.
                  </td>
                </tr>
              ) : (
                robots.map((r) => (
                  <tr key={r.idRobot}>
                    <td className="align-middle fw-bold">{r.nombre}</td>
                    <td className="align-middle">
                        <span className="badge bg-light text-dark border">{r.nickname}</span>
                    </td>
                    <td className="align-middle">
                        <span className="badge bg-info text-dark">{r.categoria}</span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-warning btn-sm me-2"
                        onClick={() => abrirEditar(r)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => eliminar(r.idRobot)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{editingId ? "Editar Robot" : "Registrar Nuevo Robot"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
              </div>
              
              <div className="modal-body">
                <div className="mb-3">
                    <label className="form-label">Nombre del Robot</label>
                    <input
                        className="form-control"
                        placeholder="Ej: Destructor 3000"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Nickname (Alias)</label>
                    <input
                        className="form-control"
                        placeholder="Ej: El Titan"
                        value={form.nickname}
                        onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                    />
                    <div className="form-text text-muted">
                        El sistema validará que no contenga lenguaje ofensivo.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select
                        className="form-control"
                        value={form.categoria}
                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    >
                        <option value="">-- Seleccione --</option>
                        <option value="MINISUMO">Minisumo</option>
                        <option value="MICROSUMO">Microsumo</option>
                        <option value="MEGASUMO">Megasumo</option>
                        <option value="DRONE">Drone</option>
                        <option value="FOLLOWER">Line Follower</option>
                        <option value="SOCCER">Soccer</option>
                    </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button
                  className="btn btn-primary"
                  onClick={guardar}
                  disabled={!form.nombre || !form.nickname || !form.categoria}
                >
                  {editingId ? "Guardar Cambios" : "Crear Robot"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}