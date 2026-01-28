import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { FaSearch, FaBan, FaRobot, FaTrophy, FaListAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../../services/axiosConfig"; // Asegúrate de que apunte a tu configuración

export default function AdminInscripcion() {

  // =========================
  // ESTADOS
  // =========================
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // =========================
  // CARGAR DATOS
  // =========================
  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/inscripciones");
      setInscripciones(res.data || []);
    } catch (err) {
      console.error("Error cargando inscripciones", err);
      Swal.fire("Error", "No se pudieron cargar las inscripciones desde el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // =========================
  // LÓGICA DE FILTRADO (VISUAL)
  // =========================
  const inscripcionesFiltradas = useMemo(() => {
    return inscripciones.filter((i) => {
      const termino = busqueda.toLowerCase();
      // Filtrar por Torneo, Categoría o nombre de algún Robot
      return (
        i.torneo?.toLowerCase().includes(termino) ||
        i.categoria?.toLowerCase().includes(termino) ||
        i.robots?.some(r => r.toLowerCase().includes(termino))
      );
    });
  }, [inscripciones, busqueda]);

  // =========================
  // ACCIONES (LÓGICA DELEGADA AL BACKEND)
  // =========================
  const anular = async (id) => {
    const result = await Swal.fire({
      title: "¿Anular inscripción?",
      text: "El backend verificará si es posible realizar la anulación (ej. torneo no iniciado).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, proceder",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/inscripciones/${id}/anular`);
      
      // ÉXITO: Recargamos los datos para ver el estado real que dejó el backend
      Swal.fire("Procesado", "La solicitud ha sido procesada correctamente.", "success");
      cargar(); 

    } catch (err) {
      // ERROR: Mostramos la razón específica que nos dio el backend
      const msg = err.response?.data?.mensaje || "No se pudo anular la inscripción";
      Swal.fire("Error", msg, "error");
    }
  };

  // =========================
  // RENDER (VISUALMENTE IGUAL)
  // =========================
  return (
    <div className="container-fluid px-4 mt-4">
      
      {/* HEADER Y BUSCADOR */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="fw-bold m-0 text-dark">
          <FaListAlt className="me-2 text-primary" />
          Gestión de Inscripciones
        </h2>
        
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <span className="input-group-text bg-white border-end-0">
            <FaSearch className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Buscar torneo, robot..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* ESTADO DE CARGA */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Consultando registros...</p>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">#</th>
                    <th><FaTrophy className="me-1 text-warning"/> Torneo</th>
                    <th>Categoría</th>
                    <th>Modalidad</th>
                    <th><FaRobot className="me-1 text-secondary"/> Robots / Participantes</th>
                    <th>Estado</th>
                    <th className="text-end pe-4">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {inscripcionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No se encontraron inscripciones.
                      </td>
                    </tr>
                  ) : (
                    inscripcionesFiltradas.map((i, index) => (
                      <tr key={i.idInscripcion}>
                        <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                        
                        <td className="fw-semibold">{i.torneo}</td>
                        
                        <td><span className="badge bg-light text-dark border">{i.categoria}</span></td>
                        
                        <td>
                          <small className="text-muted text-uppercase">{i.modalidad}</small>
                        </td>

                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {i.robots?.map((robot, idx) => (
                              <span key={idx} className="badge bg-info bg-opacity-10 text-info border border-info">
                                {robot}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td>
                          {i.estado === "ACTIVADA" ? (
                            <span className="badge bg-success bg-opacity-10 text-success d-flex align-items-center gap-1 w-auto" style={{width: 'fit-content'}}>
                              <FaCheckCircle size={12}/> Activa
                            </span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-1 w-auto" style={{width: 'fit-content'}}>
                              <FaTimesCircle size={12}/> Anulada
                            </span>
                          )}
                        </td>

                        <td className="text-end pe-4">
                          {i.estado === "ACTIVADA" && (
                            <button
                              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
                              onClick={() => anular(i.idInscripcion)}
                              title="Anular Inscripción"
                            >
                              <FaBan /> <span className="d-none d-md-inline">Anular</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Footer de la tabla con contador */}
          <div className="card-footer bg-white border-top-0 py-3">
            <small className="text-muted">
              Mostrando {inscripcionesFiltradas.length} de {inscripciones.length} registros
            </small>
          </div>
        </div>
      )}
    </div>
  );
}
