import { useMemo } from "react";

export default function JuezDashboard() {
  const displayName = useMemo(() => {
    const storedUser = localStorage.getItem("usuario");
    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      const fullName = `${user?.nombres || ""} ${user?.apellidos || ""}`.trim();
      return (
        fullName ||
        user?.nombre ||
        user?.usuario ||
        user?.correo ||
        "Juez"
      );
    } catch {
      return "Juez";
    }
  }, []);

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      <div className="juez-welcome p-4 p-md-5 mb-4 rounded-4 shadow-sm text-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <p className="text-uppercase small fw-bold mb-2 opacity-75">Panel de juez</p>
            <h2 className="fw-bold mb-1">¡Bienvenido, {displayName}!</h2>
            <p className="mb-0 opacity-75">
              Evalúa con precisión y mantén la calidad del torneo.
            </p>
          </div>
          <div className="badge bg-light text-dark fw-bold px-3 py-2 align-self-md-start">
            Robotech 2026
          </div>
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm p-4">
        <h5 className="fw-bold mb-1 text-dark">Encuentros asignados</h5>
        <p className="text-muted mb-0">
          Aquí podrás calificar los combates y registrar observaciones.
        </p>
      </div>

      <style>{`
        .juez-welcome {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
        }
      `}</style>
    </div>
  );
}
