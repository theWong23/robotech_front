import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaCogs, FaUserTie, FaMapMarkerAlt, FaGamepad, FaArrowLeft, FaCheck } from "react-icons/fa";
import api from "../../services/axiosConfig"; // Apunta a tu configuración centralizada

export default function AdminGenerarEncuentros() {
  const { idCategoriaTorneo } = useParams();
  const navigate = useNavigate();

  // Estados
  const [tipoEncuentro, setTipoEncuentro] = useState("");
  const [jueces, setJueces] = useState([]);
  const [coliseos, setColiseos] = useState([]);
  const [idJuez, setIdJuez] = useState("");
  const [idColiseo, setIdColiseo] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // =========================
  // 1. CARGA INICIAL (Datos Auxiliares)
  // =========================
  useEffect(() => {
    if (!idCategoriaTorneo) {
      Swal.fire("Error", "Falta ID de categoría", "error");
      navigate("/admin/encuentros");
      return;
    }

    const fetchData = async () => {
      try {
        // Carga paralela de listas auxiliares
        const [resJueces, resColiseos] = await Promise.all([
          api.get("/admin/jueces"),
          api.get("/admin/coliseos")
        ]);
        setJueces(resJueces.data || []);
        setColiseos(resColiseos.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        Swal.fire("Error", "No se pudieron cargar las listas de jueces/coliseos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idCategoriaTorneo, navigate]);

  // =========================
  // 2. GENERAR ENCUENTROS (Lógica en Backend)
  // =========================
  const generar = async () => {
    // A. Validación visual mínima
    if (!tipoEncuentro || !idJuez || !idColiseo) {
      return Swal.fire("Campos incompletos", "Por favor selecciona todas las opciones.", "warning");
    }

    // B. Confirmación de usuario
    const result = await Swal.fire({
      title: "¿Generar Encuentros?",
      text: "El backend creará los cruces automáticamente basándose en los inscritos.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, generar",
      cancelButtonText: "Cancelar"
    });

    if (!result.isConfirmed) return;

    setGenerating(true);
    
    // C. Payload limpio para el servidor
    const payload = { 
      idCategoriaTorneo, 
      tipoEncuentro, 
      idJuez, 
      idColiseo 
    };

    try {
      // D. Petición al Backend (El cerebro de la operación)
      await api.post("/admin/encuentros/generar", payload);
      
      await Swal.fire({
        icon: 'success',
        title: '¡Generado!',
        text: 'Los encuentros han sido creados exitosamente.',
        timer: 2000
      });
      
      // Redirigir al panel principal tras el éxito
      navigate("/admin/encuentros");

    } catch (err) {
      console.error(err);
      // E. Mostrar error específico del negocio (ej: "Número impar de equipos")
      const msg = err.response?.data?.message || err.response?.data || "Error al generar encuentros";
      Swal.fire("Error", msg, "error");
    } finally {
      setGenerating(false);
    }
  };

  // =========================
  // 3. RENDER (Visualmente Idéntico)
  // =========================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "300px"}}>
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-2 text-muted">Cargando opciones...</span>
      </div>
    );
  }

  const isFormValid = tipoEncuentro && idJuez && idColiseo;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white p-3">
              <h4 className="fw-bold mb-0 d-flex align-items-center">
                <FaCogs className="me-2"/> Generar Encuentros
              </h4>
            </div>

            <div className="card-body p-4">
              <p className="text-muted mb-4">
                Configura los parámetros para generar automáticamente los cruces de esta categoría.
              </p>

              {/* MODALIDAD */}
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary small">
                  <FaGamepad className="me-1 text-primary"/> MODALIDAD DE JUEGO
                </label>
                <select 
                  className="form-select form-select-lg" 
                  value={tipoEncuentro} 
                  onChange={e => setTipoEncuentro(e.target.value)}
                >
                  <option value="">Seleccione una modalidad...</option>
                  <option value="ELIMINACION_DIRECTA">Eliminación Directa (Bracket)</option>
                  <option value="TODOS_CONTRA_TODOS">Todos contra Todos (Liga)</option>
                </select>
              </div>

              {/* JUEZ */}
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary small">
                  <FaUserTie className="me-1 text-primary"/> JUEZ PRINCIPAL
                </label>
                <select 
                  className="form-select" 
                  value={idJuez} 
                  onChange={e => setIdJuez(e.target.value)}
                >
                  <option value="">Seleccione un juez...</option>
                  {jueces.map(j => (
                    <option key={j.idJuez} value={j.idJuez}>
                      {j.usuario ? `${j.usuario.nombres} ${j.usuario.apellidos}` : `Juez ID: ${j.idJuez}`}
                    </option>
                  ))}
                </select>
                {jueces.length === 0 && <small className="text-danger">No hay jueces registrados.</small>}
              </div>

              {/* COLISEO */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary small">
                  <FaMapMarkerAlt className="me-1 text-primary"/> LUGAR DEL ENCUENTRO
                </label>
                <select 
                  className="form-select" 
                  value={idColiseo} 
                  onChange={e => setIdColiseo(e.target.value)}
                >
                  <option value="">Seleccione un coliseo...</option>
                  {coliseos.map(c => (
                    <option key={c.idColiseo} value={c.idColiseo}>
                      {c.nombre} {c.ubicacion ? `— ${c.ubicacion}` : ""}
                    </option>
                  ))}
                </select>
                {coliseos.length === 0 && <small className="text-danger">No hay coliseos registrados.</small>}
              </div>

              {/* BOTONES */}
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-success btn-lg" 
                  onClick={generar} 
                  disabled={!isFormValid || generating}
                >
                  {generating ? (
                    <>Generando... <span className="spinner-border spinner-border-sm ms-2"/> </>
                  ) : (
                    <><FaCheck className="me-2"/> Generar Encuentros</>
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => navigate("/admin/encuentros")}
                  disabled={generating}
                >
                  <FaArrowLeft className="me-2"/> Volver
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}