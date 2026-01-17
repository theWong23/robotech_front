import { useEffect, useState, useCallback, useContext } from "react";
import Swal from "sweetalert2";
import { FaUserCheck, FaUserTimes, FaSearch, FaUsers, FaIdCard, FaSpinner } from "react-icons/fa";
import api from "../../services/axiosConfig";
import AuthContext from "../../context/AuthContext";

export default function ClubCompetidores() {
  const { user } = useContext(AuthContext);
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  const idClub = user?.idClub;

  // ============================
  // CARGAR (Lógica de filtrado en Backend)
  // ============================
  const cargar = useCallback(async (termino = "") => {
    if (!idClub) return;

    setLoading(true);
    try {
      // ENVIAMOS el término de búsqueda al backend
      const res = await api.get(`/competidores/club/${idClub}`, {
        params: { busqueda: termino } 
      });
      setLista(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo obtener la lista del servidor", "error");
    } finally {
      setLoading(false);
    }
  }, [idClub]);

  // Debounce para no saturar al servidor mientras escribes
  useEffect(() => {
    const timer = setTimeout(() => {
      cargar(busqueda);
    }, 500);
    return () => clearTimeout(timer);
  }, [busqueda, cargar]);

  // ============================
  // ACCIONES (Validaciones en Backend)
  // ============================
  const manejarEstado = async (id, accion, endpoint) => {
    // Confirmación visual solamente
    if (accion === "rechazar") {
      const result = await Swal.fire({
        title: "¿Confirmar rechazo?",
        text: "El backend procesará la baja y notificará al usuario.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Sí, rechazar",
        cancelButtonText: "Cancelar"
      });
      if (!result.isConfirmed) return;
    }

    try {
      Swal.fire({ title: 'Procesando...', didOpen: () => Swal.showLoading() });
      
      // El backend validará si el estado actual permite el cambio
      await api.put(`/competidores/${id}/${endpoint}`);
      
      Swal.fire({
        icon: accion === "aprobar" ? "success" : "info",
        title: "Procesado",
        text: `La solicitud de ${accion} fue exitosa.`,
        timer: 1500,
        showConfirmButton: false
      });
      
      cargar(busqueda); // Recargar datos frescos del servidor
    } catch (error) {
      // Mostrar el error exacto que devuelve el backend (ej: "Documentación incompleta")
      const msg = error.response?.data?.mensaje || "No se pudo procesar la solicitud";
      Swal.fire("Error", msg, "error");
    }
  };

  // ============================
  // RENDER
  // ============================
  if (!idClub) return <div className="alert alert-danger m-4">Error: No se identificó el club.</div>;

  return (
    <div className="container-fluid">
      
      {/* --- ENCABEZADO --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaUsers className="me-2 text-primary" />
            Gestión de Competidores
          </h2>
          <p className="text-muted mb-0">Valida a los miembros que se unen a tu club</p>
        </div>

        {/* Buscador (Server Side) */}
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <span className="input-group-text bg-white border-end-0">
            <FaSearch className="text-muted" />
          </span>
          <input 
            type="text" 
            className="form-control border-start-0 ps-0" 
            placeholder="Buscar en el servidor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* --- LISTADO --- */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          
          {loading ? (
             <div className="text-center py-5">
               <FaSpinner className="spinner-border text-primary" />
               <p className="mt-2 text-muted">Consultando base de datos...</p>
             </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3">Competidor</th>
                    <th>DNI / Identificación</th>
                    <th>Estado</th>
                    <th className="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        No se encontraron resultados en el servidor.
                      </td>
                    </tr>
                  ) : (
                    lista.map((c) => (
                      <tr key={c.idCompetidor}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            {/* Avatar */}
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', fontWeight: 'bold'}}>
                              {c.nombres?.charAt(0)}{c.apellidos?.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{c.nombres} {c.apellidos}</div>
                              <div className="small text-muted">
                                {c.usuario?.email || c.correo || "Sin correo"}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <span className="text-secondary fw-medium">
                            <FaIdCard className="me-2" />{c.dni}
                          </span>
                        </td>

                        <td>
                          <span className={`badge rounded-pill px-3 py-2 ${
                            c.estadoValidacion === "VALIDADO" || c.estadoValidacion === "APROBADO" 
                              ? "bg-success-subtle text-success border border-success" 
                              : c.estadoValidacion === "RECHAZADO" 
                                ? "bg-danger-subtle text-danger border border-danger" 
                                : "bg-warning-subtle text-warning-emphasis border border-warning"
                          }`}>
                            {c.estadoValidacion}
                          </span>
                        </td>

                        <td className="text-end pe-4">
                          {c.estadoValidacion === "PENDIENTE" ? (
                            <div className="btn-group">
                              <button 
                                className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                                title="Aprobar"
                                onClick={() => manejarEstado(c.idCompetidor, "aprobar", "aprobar")}
                              >
                                <FaUserCheck /> <span className="d-none d-md-inline">Aprobar</span>
                              </button>
                              <button 
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                title="Rechazar"
                                onClick={() => manejarEstado(c.idCompetidor, "rechazar", "rechazar")}
                              >
                                <FaUserTimes /> <span className="d-none d-md-inline">Rechazar</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small fst-italic">Gestionado</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}