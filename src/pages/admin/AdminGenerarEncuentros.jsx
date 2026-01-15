import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";

export default function AdminGenerarEncuentros() {

  const { idCategoriaTorneo } = useParams();
  const navigate = useNavigate();

  const [tipoEncuentro, setTipoEncuentro] = useState("");
  const [jueces, setJueces] = useState([]);
  const [coliseos, setColiseos] = useState([]);
  
  const [idJuez, setIdJuez] = useState("");
  const [idColiseo, setIdColiseo] = useState("");

  // 🔒 VALIDACIÓN: Verificar que tenemos el ID de la categoría
  useEffect(() => {
    if (!idCategoriaTorneo) {
      Swal.fire(
        "Error",
        "No se recibió la categoría del torneo",
        "error"
      );
      navigate("/admin/encuentros");
    }
  }, [idCategoriaTorneo, navigate]);

  // 📥 CARGA DE DATOS (Jueces y Coliseos)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resJueces, resColiseos] = await Promise.all([
          api.get("/admin/jueces"),
          api.get("/admin/coliseos")
        ]);
        
        setJueces(resJueces.data);
        setColiseos(resColiseos.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
        Swal.fire("Error", "No se pudieron cargar las listas", "error");
      }
    };

    fetchData();
  }, []);

  // 💾 GENERAR ENCUENTROS
  const generar = async () => {

    if (!tipoEncuentro || !idJuez || !idColiseo) {
      Swal.fire("Atención", "Completa todos los campos", "warning");
      return;
    }

    const payload = {
      idCategoriaTorneo,
      tipoEncuentro,
      idJuez,
      idColiseo
    };

    console.log("📦 Payload enviado:", payload);

    try {
      // ✅ CORREGIDO: Una sola llamada a la API
      await api.post("/admin/encuentros/generar", payload);

      Swal.fire(
        "Encuentros generados",
        "Los encuentros fueron creados correctamente",
        "success"
      );

      navigate("/admin/encuentros");

    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err?.response?.data?.message ?? "No se pudieron generar los encuentros",
        "error"
      );
    }
  };

  return (
    <div className="card p-4 shadow-sm">
      <h4 className="fw-bold mb-3">Generar Encuentros</h4>

      {/* TIPO DE ENCUENTRO */}
      <div className="mb-3">
        <label className="form-label">Modalidad de Juego</label>
        <select
          className="form-select"
          value={tipoEncuentro}
          onChange={e => setTipoEncuentro(e.target.value)}
        >
          <option value="">Seleccione...</option>
          <option value="ELIMINACION_DIRECTA">Eliminación Directa</option>
          <option value="TODOS_CONTRA_TODOS">Todos contra Todos</option>
        </select>
      </div>

      {/* SELECCIÓN DE JUEZ */}
      <div className="mb-3">
        <label className="form-label">Juez Principal</label>
        <select
          className="form-select"
          value={idJuez}
          onChange={e => setIdJuez(e.target.value)}
        >
          <option value="" disabled>Seleccionar Juez</option>
          {jueces.map(j => (
            <option key={j.idJuez} value={j.idJuez}>
              {/* ✅ CORREGIDO: Validación de objeto usuario */}
              {j.usuario 
                ? `${j.usuario.nombres} ${j.usuario.apellidos}` 
                : `Juez #${j.idJuez} (Nombre no disponible)`}
            </option>
          ))}
        </select>
      </div>

      {/* SELECCIÓN DE COLISEO */}
      <div className="mb-4">
        <label className="form-label">Lugar del Encuentro</label>
        <select
          className="form-select"
          value={idColiseo}
          onChange={e => setIdColiseo(e.target.value)}
        >
          <option value="">Seleccionar Coliseo</option>
          {coliseos.map(c => (
            <option key={c.idColiseo} value={c.idColiseo}>
              {c.nombre} {c.ubicacion ? `(${c.ubicacion})` : ""}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-success w-100" onClick={generar}>
        Generar Encuentros
      </button>
    </div>
  );
}