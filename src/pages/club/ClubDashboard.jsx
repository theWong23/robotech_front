import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import "../../styles/ClubPanel.css";

export default function ClubDashboard() {
  const [club, setClub] = useState(null);
  const [codigos, setCodigos] = useState([]);

  // 🔐 LEER USUARIO DE FORMA SEGURA
  const storedUser = localStorage.getItem("usuario");
  const entidad = storedUser ? JSON.parse(storedUser) : null;
  const idClub = entidad?.idClub;

  // ============================
  //     CARGAR DATOS DEL CLUB
  // ============================
  const cargarClub = useCallback(async () => {
    try {
      const res = await api.get(`/api/clubes/${idClub}`);
      setClub(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "No se pudo cargar la información del club",
        "error"
      );
    }
  }, [idClub]);

  // ============================
  //     CARGAR CÓDIGOS
  // ============================
  const cargarCodigos = useCallback(async () => {
    try {
      const res = await api.get(`/api/codigos/club/${idClub}`);
      setCodigos(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "No se pudieron cargar los códigos",
        "error"
      );
    }
  }, [idClub]);

  // ============================
  //     EFFECT
  // ============================
  useEffect(() => {
    if (idClub) {
      cargarClub();
      cargarCodigos();
    }
  }, [idClub, cargarClub, cargarCodigos]);

  // ============================
  //     GENERAR CÓDIGO
  // ============================
  const generarCodigo = async () => {
    const { value: valores } = await Swal.fire({
      title: "Generar Código de Registro",
      html: `
        <label>Horas de Expiración</label>
        <input id="horas" type="number" class="swal2-input" value="24">

        <label>Límite de Uso</label>
        <input id="limite" type="number" class="swal2-input" value="1">
      `,
      showCancelButton: true,
      confirmButtonText: "Generar",
      preConfirm: () => ({
        horas: document.getElementById("horas").value,
        limite: document.getElementById("limite").value
      })
    });

    if (!valores) return;

    try {
      const res = await api.post(
        `/api/codigos/${idClub}/generar`,
        {
          horasExpiracion: Number(valores.horas),
          limiteUso: Number(valores.limite)
        }
      );

      Swal.fire(
        "Código generado",
        `Código: ${res.data.codigo}`,
        "success"
      );

      cargarCodigos();
    } catch {
      Swal.fire("Error", "No se pudo generar el código", "error");
    }
  };

  // 🛑 BLOQUEO DE SEGURIDAD
  if (!entidad) {
    return <div>No hay sesión activa. Inicia sesión nuevamente.</div>;
  }

  if (!club) {
    return <div>Cargando información del club...</div>;
  }

  // ============================
  //     RENDER
  // ============================
  return (
    <>
      {/* PERFIL DEL CLUB */}
      <div className="club-card shadow">
        <img
          src={club.logoUrl || "/default-club.png"}
          alt="logo"
          className="club-avatar"
        />

        <h2 className="club-name">{club.nombre}</h2>
        <p className="club-desc">
          {club.descripcion || "Club de robótica"}
        </p>

        <div className="club-stats">
          <div>
            <h4>{club.totalCompetidores}</h4>
            <span>Competidores</span>
          </div>

          <div>
            <h4>{club.totalRobots}</h4>
            <span>Robots</span>
          </div>

          <div>
            <h4>{codigos.length}</h4>
            <span>Códigos</span>
          </div>
        </div>

        <button className="btn-generate" onClick={generarCodigo}>
          Generar Código de Registro
        </button>
      </div>

      {/* LISTA DE CÓDIGOS */}
      <h4 className="fw-bold mt-5">Códigos Generados</h4>

      <div className="codigos-grid mt-3">
        {codigos.length === 0 ? (
          <p className="text-muted">No hay códigos generados</p>
        ) : (
          codigos.map(c => (
            <div key={c.codigo} className="codigo-card shadow-sm">
              <h5>{c.codigo}</h5>

              <p><strong>Creado:</strong> {new Date(c.creadoEn).toLocaleString()}</p>
              <p><strong>Expira:</strong> {new Date(c.expiraEn).toLocaleString()}</p>
              <p><strong>Usos:</strong> {c.usosActuales}/{c.limiteUso}</p>

              <span
                className={
                  c.usado
                    ? "badge bg-danger"
                    : new Date(c.expiraEn) < new Date()
                    ? "badge bg-secondary"
                    : "badge bg-success"
                }
              >
                {c.usado
                  ? "Usado"
                  : new Date(c.expiraEn) < new Date()
                  ? "Expirado"
                  : "Vigente"}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
