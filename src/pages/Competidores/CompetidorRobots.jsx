import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig"; // Verifica que la ruta sea correcta

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
  // Ajusta 'idCompetidor' o 'id' según cómo guardes el usuario en el login
  const idCompetidor = usuario?.idCompetidor || usuario?.id; 

  // =============================
  // CARGAR ROBOTS
  // =============================
  const cargarRobots = async () => {
    if (!idCompetidor) return;
    try {
      const res = await api.get(`/competidor/robots/${idCompetidor}`);
      setRobots(res.data);
    } catch (error) {
      console.error("Error cargando robots:", error);
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
  // 💾 GUARDAR (Conexión con Validaciones Backend)
  // =============================
  const guardar = async () => {
    // 1. Validación Frontend (Campos vacíos)
    if (!form.nombre.trim() || !form.nickname.trim() || !form.categoria) {
      Swal.fire("Atención", "Por favor completa todos los campos.", "warning");
      return;
    }

    try {
      // 2. Enviar petición al Backend
      if (editingId) {
        await api.put(`/competidor/robots/${editingId}`, form);
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Datos del robot actualizados correctamente.",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post(`/competidor/robots/${idCompetidor}`, form);
        Swal.fire({
          icon: "success",
          title: "¡Registrado!",
          text: "Robot creado exitosamente.",
          timer: 2000,
          showConfirmButton: false
        });
      }

      setModal(false);
      cargarRobots(); // Recargar lista

    } catch (err) {
      console.error("Error al guardar:", err);

      // 3. 🛡️ CAPTURA DE ERRORES DEL BACKEND
      let mensajeError = "Ocurrió un error inesperado.";
      let tipoAlerta = "error"; // Por defecto rojo

      // Verificamos si el backend nos envió un mensaje (gracias a server.error.include-message=always)
      if (err.response && err.response.data) {
        // Estructura estándar de Spring Boot suele ser { message: "Texto...", ... }
        if (err.response.data.message) {
          mensajeError = err.response.data.message;
        } else if (typeof err.response.data === "string") {
          mensajeError = err.response.data;
        }

        // 4. Detectar si es una Validación de Negocio para cambiar el ícono a Amarillo
        if (
          mensajeError.includes("ya está en uso") || 
          mensajeError.includes("Ya tienes un robot") || 
          mensajeError.includes("inválida") ||
          mensajeError.includes("límite")
        ) {
          tipoAlerta = "warning";
        }
      }

      // Mostrar SweetAlert con el mensaje exacto del Backend
      Swal.fire({
        icon: tipoAlerta,
        title: tipoAlerta === "warning" ? "Restricción" : "Error",
        text: mensajeError,
        confirmButtonColor: "#d33"
      });
    }
  };

  // =============================
  // ELIMINAR
  // =============================
  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar robot?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/competidor/robots/${id}`);
      Swal.fire("Eliminado", "El robot ha sido eliminado.", "success");
      cargarRobots();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar el robot.", "error");
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
        <button className="btn btn-success shadow-sm" onClick={abrirCrear}>
          <i className="bi bi-plus-lg me-2"></i> Nuevo Robot
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Nombre</th>
                <th>Nickname</th>
                <th>Categoría</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {robots.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <h4>📭</h4>
                    <p>No tienes robots registrados aún.</p>
                  </td>
                </tr>
              ) : (
                robots.map((r) => (
                  <tr key={r.idRobot}>
                    <td className="ps-4 fw-bold text-dark">{r.nombre}</td>
                    <td>
                        <span className="badge bg-light text-dark border">@{r.nickname}</span>
                    </td>
                    <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                          {r.categoria}
                        </span>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => abrirEditar(r)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminar(r.idRobot)}
                        title="Eliminar"
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
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  {editingId ? "✏️ Editar Robot" : "🤖 Registrar Nuevo Robot"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
              </div>
              
              <div className="modal-body p-4">
                <div className="mb-3">
                    <label className="form-label fw-bold">Nombre del Robot</label>
                    <input
                        className="form-control"
                        placeholder="Ej: Destructor 3000"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        maxLength={30}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Nickname (Alias único)</label>
                    <input
                        className="form-control"
                        placeholder="Ej: El Titan"
                        value={form.nickname}
                        onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                        maxLength={20}
                    />
                    <div className="form-text text-muted small">
                        Debe ser único en todo el torneo. No se permite lenguaje ofensivo.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Categoría</label>
                    <select
                        className="form-select"
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

              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button
                  className="btn btn-primary px-4"
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