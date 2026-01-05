import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { nicknameEsValido } from "../../utils/nicknameValidator";
import api from "../../services/axiosConfig";

export default function CompetidorRobots() {

  const [robots, setRobots] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    nickname: "",
    categoria: "",
  });

  // Obtener competidor logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const entidad = JSON.parse(localStorage.getItem("entidad"));
  const idCompetidor = entidad?.idCompetidor;

    const cargarRobots = async () => {
    try {
      const res = await api.get(
        `http://localhost:8080/api/competidor/robots/${idCompetidor}`
      );
      setRobots(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  if (idCompetidor) {
    cargarRobots();
  }
}, [idCompetidor]);
  

  const abrirCrear = () => {
    setForm({ nombre: "", nickname: "", categoria: "" });
    setEditingId(null);
    setModal(true);
  };

  const guardar = async () => {

    if (!nicknameEsValido(form.nickname)) {
    Swal.fire(
      "Error",
      "El nickname contiene palabras inapropiadas.",
      "error"
    );
    return; // Detener envío
  }

    try {
      if (editingId) {
        await api.put(
          `http://localhost:8080/api/competidor/robots/${editingId}`,
          form
        );
        Swal.fire("Robot actualizado", "", "success");
      } else {
        await api.post(
          `http://localhost:8080/api/competidor/robots/${idCompetidor}`,
          form
        );
        Swal.fire("Robot creado", "", "success");
      }

      setModal(false);
      cargarRobots();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data || "No se pudo guardar", "error");
    }
  };

  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar robot?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`http://localhost:8080/api/competidor/robots/${id}`);
      Swal.fire("Eliminado", "", "success");
      cargarRobots();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar el robot", "error");
    }
  };

  return (
    <div className="container mt-4">

      <h2 className="fw-bold">Mis Robots</h2>

      <button className="btn btn-success my-3" onClick={abrirCrear}>
        ➕ Registrar Robot
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Nickname</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {robots.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No tienes robots registrados
              </td>
            </tr>
          ) : (
            robots.map((r) => (
              <tr key={r.idRobot}>
                <td>{r.nombre}</td>
                <td>{r.nickname}</td>
                <td>{r.categoria}</td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => {
                      setEditingId(r.idRobot);
                      setForm({
                        nombre: r.nombre,
                        nickname: r.nickname,
                        categoria: r.categoria,
                      });
                      setModal(true);
                    }}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminar(r.idRobot)}
                  >
                    Eliminar
                  </button>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {modal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">

              <h4>{editingId ? "Editar Robot" : "Crear Robot"}</h4>

              <input
                className="form-control mt-2"
                placeholder="Nombre del robot"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />

              <input
                className="form-control mt-2"
                placeholder="Nickname"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              />

              <select
                className="form-control mt-2"
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              >
                <option value="">Seleccione categoría</option>
                <option value="MINISUMO">MINISUMO</option>
                <option value="MICROSUMO">MICROSUMO</option>
                <option value="MEGASUMO">MEGASUMO</option>
                <option value="DRONE">DRONE</option>
                <option value="FOLLOWER">FOLLOWER</option>
              </select>

              <div className="mt-3 d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={guardar}>Guardar</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
