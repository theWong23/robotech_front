import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaTrophy, FaRobot, FaSave, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import api from "../../services/api";
import Swal from "sweetalert2";

export default function CalificarEncuentro() {
  const { idEncuentro } = useParams();
  const navigate = useNavigate();

  const [encuentro, setEncuentro] = useState(null);
  const [puntajes, setPuntajes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar datos
  useEffect(() => {
    // Nota: Idealmente tu API debería soportar GET /juez/encuentros/:id
    // Si no, mantenemos esta lógica de buscar en el array
    api.get("/juez/encuentros")
      .then(res => {
        const enc = res.data.find(e => String(e.idEncuentro) === String(idEncuentro));
        if (enc) {
          setEncuentro(enc);
          // Inicializar puntajes si ya existieran (opcional)
        } else {
          Swal.fire("Error", "Encuentro no encontrado o no asignado", "error");
          navigate("/juez/encuentros");
        }
      })
      .catch(() => {
        Swal.fire("Error", "Error de conexión con el servidor", "error");
      })
      .finally(() => setLoading(false));
  }, [idEncuentro, navigate]);

  // 🏆 Cálculo del Ganador en Tiempo Real
  const getGanadorId = () => {
    const entradas = Object.entries(puntajes);
    if (entradas.length < 2) return null; // Esperar a tener datos

    // Ordenar de mayor a menor puntaje
    const ordenados = entradas.sort((a, b) => b[1] - a[1]);
    
    // Si el primero tiene más puntaje que el segundo, es ganador. Si hay empate, null.
    if (ordenados[0][1] > ordenados[1]?.[1]) {
      return ordenados[0][0];
    }
    return null; // Empate o datos incompletos
  };

  const ganadorId = getGanadorId();

  // 📝 Manejador de Inputs
  const handleScoreChange = (idReferencia, value) => {
    // Validar rango 0-100
    let val = parseInt(value);
    if (isNaN(val)) val = ""; 
    if (val > 100) val = 100;
    if (val < 0) val = 0;

    setPuntajes(prev => ({
      ...prev,
      [idReferencia]: val
    }));
  };

  // 💾 Guardar Resultado
  const guardarResultado = async () => {
    // 1. Validaciones
    const participantesIds = encuentro.participantes.map(p => p.idReferencia);
    const faltanPuntajes = participantesIds.some(id => puntajes[id] === "" || puntajes[id] === undefined);

    if (faltanPuntajes) {
      Swal.fire("Atención", "Debes asignar un puntaje a todos los competidores.", "warning");
      return;
    }

    setSaving(true);

    try {
      await api.post(`/juez/encuentros/${idEncuentro}/resultado`, {
        calificaciones: participantesIds.map(id => ({
          idReferencia: id,
          calificacion: Number(puntajes[id])
        }))
      });

      await Swal.fire({
        title: "¡Calificación Guardada!",
        text: "El encuentro ha sido finalizado correctamente.",
        icon: "success",
        confirmButtonColor: "#00b3b3"
      });
      
      navigate("/juez/encuentros");

    } catch (err) {
      Swal.fire("Error", err?.response?.data ?? "No se pudo guardar el resultado", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-info" role="status"><span className="visually-hidden">Cargando...</span></div>
    </div>
  );

  return (
    <div className="container-fluid max-w-4xl mx-auto">
      
      {/* --- Encabezado --- */}
      <div className="d-flex align-items-center mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary me-3 rounded-circle">
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="fw-bold mb-0">Calificar Encuentro #{idEncuentro}</h2>
          <p className="text-muted mb-0">
            Categoría: <strong>{encuentro.categoria}</strong> | Tipo: <strong>{encuentro.tipo}</strong>
          </p>
        </div>
      </div>

      <div className="row g-4">
        
        {/* --- Columna Izquierda: Tarjetas de Competidores --- */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold text-secondary">Participantes</h5>
            </div>
            <div className="card-body">
              {encuentro.participantes.map(p => {
                const esGanador = String(ganadorId) === String(p.idReferencia);
                const score = puntajes[p.idReferencia] ?? "";

                return (
                  <div 
                    key={p.idReferencia} 
                    className={`d-flex align-items-center justify-content-between p-3 mb-3 rounded border transition-all
                      ${esGanador ? "border-success bg-success-subtle shadow-sm" : "border-light bg-light"}
                    `}
                    style={{ transition: "0.3s ease" }}
                  >
                    
                    {/* Info Robot */}
                    <div className="d-flex align-items-center gap-3">
                      <div className={`p-3 rounded-circle ${esGanador ? "bg-success text-white" : "bg-white text-secondary border"}`}>
                        {esGanador ? <FaTrophy size={20} /> : <FaRobot size={20} />}
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold text-dark">{p.nombre ?? "Robot #" + p.idReferencia}</h5>
                        <small className="text-muted">ID: {p.idReferencia}</small>
                        {esGanador && <span className="badge bg-success ms-2 animate__animated animate__fadeIn">GANADOR</span>}
                      </div>
                    </div>

                    {/* Input Puntaje */}
                    <div className="text-end">
                      <label className="form-label small text-muted mb-1 d-block">Puntaje (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={e => handleScoreChange(p.idReferencia, e.target.value)}
                        className={`form-control form-control-lg text-center fw-bold ${esGanador ? "text-success border-success" : ""}`}
                        style={{ width: "100px" }}
                        placeholder="-"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- Columna Derecha: Resumen y Acción --- */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 bg-white">
            <div className="card-body text-center">
              <FaCheckCircle className="text-secondary mb-3" size={40} style={{ opacity: 0.2 }} />
              <h5 className="card-title fw-bold">Confirmar Resultado</h5>
              <p className="card-text text-muted small">
                Al guardar, el encuentro se marcará como FINALIZADO y se actualizarán los rankings. Esta acción no se puede deshacer.
              </p>
              
              <hr className="my-4"/>

              <button
                onClick={guardarResultado}
                disabled={saving}
                className="btn btn-primary w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: '#00b3b3', borderColor: '#00b3b3' }}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaSave /> Guardar Calificación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}