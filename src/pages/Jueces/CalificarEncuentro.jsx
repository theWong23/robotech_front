import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaRobot, FaArrowLeft, FaSave, FaTrophy } from "react-icons/fa";
import api from "../../services/api";
import Swal from "sweetalert2";

export default function CalificarEncuentro() {
  const { idEncuentro } = useParams();
  const navigate = useNavigate();
  
  const [encuentro, setEncuentro] = useState(null);
  const [loading, setLoading] = useState(true);

  const [puntajeP1, setPuntajeP1] = useState("");
  const [puntajeP2, setPuntajeP2] = useState("");

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        // GET /api/juez/encuentros/{idEncuentro}
        const res = await api.get(`/juez/encuentros/${idEncuentro}`);
        setEncuentro(res.data);
      } catch (err) {
        console.error("Error al cargar encuentro");
      } finally {
        setLoading(false);
      }
    };
    if (idEncuentro) fetchDetalle();
  }, [idEncuentro]);

  const handlePuntajeChange = (valor, setter) => {
    if (valor === "") { setter(""); return; }
    const num = parseInt(valor);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setter(num.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const p1 = parseInt(puntajeP1) || 0;
    const p2 = parseInt(puntajeP2) || 0;

    // Estructura que espera tu RegistrarResultadoEncuentroDTO en Java
    const dataCalificacion = {
      idEncuentro: idEncuentro,
      // Cambiado de 'puntajes' a 'calificaciones' según tu DTO de Java
      calificaciones: [
        { idReferencia: encuentro.participantes[0].idReferencia, calificacion: p1 },
        { idReferencia: encuentro.participantes[1].idReferencia, calificacion: p2 }
      ]
    };

    try {
      // ✅ URL AJUSTADA: POST /api/juez/encuentros/{idEncuentro}/resultado
      await api.post(`/juez/encuentros/${idEncuentro}/resultado`, dataCalificacion);
      
      Swal.fire("Éxito", "Resultado registrado correctamente.", "success");
      navigate("/juez/encuentros");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo registrar el resultado en el servidor.", "error");
    }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-muted p-0">
          <FaArrowLeft className="me-2" /> Volver
        </button>
        <div className="text-muted small fw-bold text-uppercase">Mesa Técnica — ID {idEncuentro}</div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="p-4 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: "#001f3f" }}>
          <div>
            <h2 className="fw-bold mb-0">{encuentro.categoria || "Calificar Encuentro"}</h2>
            <small className="opacity-75">Rango de puntuación: 0 a 100 puntos</small>
          </div>
          <FaTrophy className="text-warning fs-3" />
        </div>

        <div className="card-body p-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-5 justify-content-center align-items-center text-center">
              
              {/* ROBOT 1 */}
              <div className="col-md-5">
                <div className="p-4 rounded-4 bg-light shadow-sm">
                  <FaRobot size={40} className="text-primary mb-3" />
                  <h4 className="fw-bold text-dark">{encuentro.participantes[0].nombre}</h4>
                  <hr className="my-3 opacity-25" />
                  <input 
                    type="number" 
                    placeholder="0"
                    className="form-control form-control-lg text-center fw-bold border-0 bg-white"
                    value={puntajeP1}
                    onChange={(e) => handlePuntajeChange(e.target.value, setPuntajeP1)}
                    style={{ fontSize: '3rem', color: '#001f3f' }}
                  />
                </div>
              </div>

              <div className="col-md-2">
                <span className="display-6 fw-bold text-muted opacity-25">VS</span>
              </div>

              {/* ROBOT 2 */}
              <div className="col-md-5">
                <div className="p-4 rounded-4 bg-light shadow-sm">
                  <FaRobot size={40} className="text-danger mb-3" />
                  <h4 className="fw-bold text-dark">{encuentro.participantes[1].nombre}</h4>
                  <hr className="my-3 opacity-25" />
                  <input 
                    type="number" 
                    placeholder="0"
                    className="form-control form-control-lg text-center fw-bold border-0 bg-white"
                    value={puntajeP2}
                    onChange={(e) => handlePuntajeChange(e.target.value, setPuntajeP2)}
                    style={{ fontSize: '3rem', color: '#001f3f' }}
                  />
                </div>
              </div>

            </div>

            <div className="text-center mt-5 pt-3">
              <button 
                type="submit" 
                className="btn btn-lg px-5 py-3 shadow-sm fw-bold text-white rounded-pill"
                style={{ backgroundColor: "#00b3b3", border: "none" }}
              >
                <FaSave className="me-2" /> GUARDAR RESULTADO FINAL
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .form-control:focus { box-shadow: 0 0 0 0.25rem rgba(0, 179, 179, 0.15); border-color: #00b3b3; }
      `}</style>
    </div>
  );
}