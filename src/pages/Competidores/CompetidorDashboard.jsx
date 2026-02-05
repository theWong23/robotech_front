import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // 1. IMPORTAR useNavigate
import api from "../../services/axiosConfig";
import Swal from "sweetalert2";
import "../../styles/CompetidorDashboard.css";

export default function CompetidorDashboard() {
  const navigate = useNavigate(); // 2. INICIALIZAR EL HOOK

  // =============================
  // ESTADOS
  // =============================
  const [competidor, setCompetidor] = useState(null);
  const [editando, setEditando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [juezEstado, setJuezEstado] = useState(null);
  const [licencia, setLicencia] = useState("");
  const [loadingJuez, setLoadingJuez] = useState(false);
  const [codigoClub, setCodigoClub] = useState("");
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    dni: "",
    correo: ""
  });

  const [errores, setErrores] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    dni: "",
    correo: ""
  });

  // =============================
  // AUTH
  // =============================
  const storedUser = localStorage.getItem("usuario");
  const entidad = storedUser ? JSON.parse(storedUser) : null;
  const idCompetidor = entidad?.idCompetidor;
  const displayName = useMemo(() => {
    const fullName = `${entidad?.nombres || ""} ${entidad?.apellidos || ""}`.trim();
    return (
      fullName ||
      entidad?.nombre ||
      entidad?.usuario ||
      entidad?.correo ||
      "Competidor"
    );
  }, [entidad]);

  if (!entidad || !idCompetidor) {
    return <p>No autorizado. Inicia sesión nuevamente.</p>;
  }

  // =============================
  // CARGAR PERFIL
  // =============================
  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setLoadingSolicitudes(true);
      const res = await api.get("/competidor/club-solicitudes");
      setMisSolicitudes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const solicitarClub = async () => {
    if (!codigoClub.trim()) {
      return Swal.fire("Atenci?n", "Ingresa el c?digo del club", "warning");
    }
    try {
      await api.post("/competidor/club-solicitudes", { codigoClub: codigoClub.trim() });
      Swal.fire("Solicitud enviada", "Queda pendiente de aprobaci?n del club", "success");
      setCodigoClub("");
      cargarSolicitudes();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo enviar";
      Swal.fire("Error", msg, "error");
    }
  };

  const cancelarSolicitud = async (id) => {
    try {
      await api.post(`/competidor/club-solicitudes/${id}/cancelar`);
      Swal.fire("Cancelado", "Solicitud cancelada", "info");
      cargarSolicitudes();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo cancelar";
      Swal.fire("Error", msg, "error");
    }
  };


  const cargarEstadoJuez = async () => {
    try {
      setLoadingJuez(true);
      const res = await api.get("/competidor/juez/estado");
      setJuezEstado(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJuez(false);
    }
  };

  useEffect(() => {
    cargarEstadoJuez();
  }, []);

  const postularJuez = async () => {
    if (!licencia.trim()) {
      return Swal.fire("Atenci?n", "Ingresa tu n?mero de licencia", "warning");
    }
    try {
      await api.post("/competidor/juez/postular", { licencia: licencia.trim() });
      Swal.fire("Solicitud enviada", "Queda pendiente de aprobaci?n", "success");
      setLicencia("");
      cargarEstadoJuez();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo enviar la solicitud";
      Swal.fire("Error", msg, "error");
    }
  };


  const cargarPerfil = async () => {
    try {
      const res = await api.get(`/competidores/${idCompetidor}`);

      setCompetidor(res.data);
      setForm({
        nombres: res.data.nombres,
        apellidos: res.data.apellidos,
        telefono: res.data.telefono || "",
        dni: res.data.dni || "",
        correo: res.data.correo || ""
      });

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar el perfil", "error");
    }
  };

  // =============================
  // VALIDACIONES
  // =============================
  const validarNombreHumano = (texto) => {
    if (!texto) return "Campo obligatorio";
    const limpio = texto.trim();
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(limpio)) return "Solo letras y espacios";
    const letras = limpio.replace(/\s+/g, "");
    if (letras.length < 3) return "Mínimo 3 letras";
    return "";
  };

  const cambiar = (e) => {
    const { name, value: raw } = e.target;
    let value = raw;
    let error = "";

    // VALIDACIÓN TELÉFONO
    if (name === "telefono") {
      value = raw.replace(/\D/g, "").slice(0, 9);
      if (value.length !== 9) error = "Debe tener 9 dígitos";
    }

    // VALIDACIÓN DNI
    if (name === "dni") {
      value = raw.replace(/\D/g, "").slice(0, 8);
      if (value.length !== 8) error = "Debe tener 8 dígitos";
    }

    // VALIDACIÓN CORREO
    if (name === "correo") {
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(value)) error = "Correo inválido";
    }

    // VALIDACIÓN NOMBRES
    if (name === "nombres" || name === "apellidos") {
      error = validarNombreHumano(value);
    }

    setForm(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: error }));
  };

  const claseInput = (campo) => {
    if (!editando) return "form-control";
    if (!form[campo]) return "form-control";
    return errores[campo] ? "form-control is-invalid" : "form-control is-valid";
  };

  // =============================
  // GUARDAR CAMBIOS (AQUÍ ESTÁ LA LÓGICA DE SEGURIDAD)
  // =============================
  const guardarCambios = async () => {
    const errNom = validarNombreHumano(form.nombres);
    const errApe = validarNombreHumano(form.apellidos);
    const dniValido = /^[0-9]{8}$/.test(form.dni);
    const telValido = /^[0-9]{9}$/.test(form.telefono);
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo);

    if (errNom || errApe || !dniValido || !telValido || !correoValido) {
      Swal.fire("Datos inválidos", "Revisa los campos en rojo", "warning");
      return;
    }

    try {
      await api.put(`/competidores/${idCompetidor}`, form);

      // 3. VERIFICAMOS SI CAMBIÓ EL CORREO
      if (form.correo !== competidor.correo) {
        
        await Swal.fire({
            title: "Correo actualizado",
            text: "Has cambiado tu correo. Por seguridad, debes iniciar sesión nuevamente.",
            icon: "info",
            confirmButtonText: "Ir al Login",
            allowOutsideClick: false
        });

        // Borramos sesión y redirigimos
        localStorage.clear();
        navigate("/login");

      } else {
        // Si NO cambió el correo, todo sigue igual
        Swal.fire("Perfil actualizado", "", "success");
        setEditando(false);
        cargarPerfil();
      }

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo actualizar (quizás el correo ya existe)", "error");
    }
  };

  const cancelarEdicion = () => {
    setForm({
      nombres: competidor.nombres,
      apellidos: competidor.apellidos,
      telefono: competidor.telefono || "",
      dni: competidor.dni || "",
      correo: competidor.correo || ""
    });
    setErrores({ nombres: "", apellidos: "", telefono: "", dni: "", correo: "" });
    setEditando(false);
  };

  // =============================
  // SUBIR FOTO
  // =============================
  const subirFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    try {
      setSubiendoFoto(true);
      await api.post(
        `/competidores/${idCompetidor}/foto`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      Swal.fire("Foto actualizada", "", "success");
      cargarPerfil();
    } catch {
      Swal.fire("Error", "No se pudo subir la foto", "error");
    } finally {
      setSubiendoFoto(false);
    }
  };

  if (!competidor) return <p>Cargando perfil...</p>;

  const formularioValido =
    !errores.nombres && !errores.apellidos && !errores.telefono && !errores.dni && !errores.correo &&
    form.nombres && form.apellidos && form.telefono && form.dni && form.correo;

  // =============================
  // RENDER
  // =============================
  return (
    <div className="perfil-container">
      <div className="competidor-welcome p-4 p-md-5 mb-4 rounded-4 shadow-sm text-white">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <p className="text-uppercase small fw-bold mb-2 opacity-75">Panel de competidor</p>
            <h2 className="fw-bold mb-1">¡Hola, {displayName}!</h2>
            <p className="mb-0 opacity-75">
              Tu perfil está listo para competir y destacar en el torneo.
            </p>
          </div>
          <div className="badge bg-light text-dark fw-bold px-3 py-2 align-self-md-start">
            Robotech 2026
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="perfil-header">
        <div className="perfil-avatar-wrapper">
          <img
            src={
              competidor.fotoUrl
                ? `http://localhost:8080${competidor.fotoUrl}`
                : "/default-user.png"
            }
            className="perfil-avatar"
            onClick={() => document.getElementById("fotoInput").click()}
            title="Cambiar foto"
            alt="Avatar"
          />
          {subiendoFoto && <span className="subiendo">Subiendo...</span>}
        </div>

        <input
          type="file"
          id="fotoInput"
          hidden
          accept="image/*"
          onChange={subirFoto}
        />

        <div className="perfil-info">
          <h2>{competidor.nombres} {competidor.apellidos}</h2>
          
          <span className={`perfil-estado ${
            competidor.estadoValidacion === "APROBADO"
              ? "estado-aprobado"
              : "estado-pendiente"
          }`}>
            {competidor.estadoValidacion}
          </span>

          {!editando ? (
            <button
              className="btn btn-outline-primary btn-sm mt-2"
              onClick={() => setEditando(true)}
            >
              Editar perfil
            </button>
          ) : (
            <button
              className="btn btn-outline-secondary btn-sm mt-2"
              onClick={cancelarEdicion}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* DATOS */}
      <div className="perfil-datos">

        {/* CLUB */}
        <div className="perfil-dato">
          <label>Club</label>
          <span className="fw-bold text-primary">
             {competidor.clubNombre || "Sin club asignado"}
          </span>
        </div>

        {/* CORREO (Editable) */}
        <div className="perfil-dato">
          <label>Correo</label>
          {editando ? (
            <>
              <input
                className={claseInput("correo")}
                name="correo"
                value={form.correo}
                onChange={cambiar}
                placeholder="ejemplo@correo.com"
              />
              {errores.correo && <small className="text-danger">{errores.correo}</small>}
            </>
          ) : (
            <span className="text-muted">{competidor.correo}</span>
          )}
        </div>

        {/* DNI */}
        <div className="perfil-dato">
          <label>DNI</label>
          {editando ? (
            <>
              <input
                className={claseInput("dni")}
                name="dni"
                value={form.dni}
                onChange={cambiar}
                placeholder="8 dígitos"
                inputMode="numeric"
                maxLength={8}
              />
              {errores.dni && <small className="text-danger">{errores.dni}</small>}
            </>
          ) : (
            <span>{competidor.dni || "No registrado"}</span>
          )}
        </div>

        {/* NOMBRES */}
        <div className="perfil-dato">
          <label>Nombres</label>
          {editando ? (
            <>
              <input
                className={claseInput("nombres")}
                name="nombres"
                value={form.nombres}
                onChange={cambiar}
              />
              {errores.nombres && <small className="text-danger">{errores.nombres}</small>}
            </>
          ) : (
            <span>{competidor.nombres}</span>
          )}
        </div>

        {/* APELLIDOS */}
        <div className="perfil-dato">
          <label>Apellidos</label>
          {editando ? (
            <>
              <input
                className={claseInput("apellidos")}
                name="apellidos"
                value={form.apellidos}
                onChange={cambiar}
              />
              {errores.apellidos && <small className="text-danger">{errores.apellidos}</small>}
            </>
          ) : (
            <span>{competidor.apellidos}</span>
          )}
        </div>

        {/* TELEFONO */}
        <div className="perfil-dato">
          <label>Teléfono</label>
          {editando ? (
            <>
              <input
                className={claseInput("telefono")}
                name="telefono"
                value={form.telefono}
                onChange={cambiar}
                inputMode="numeric"
                maxLength={9}
              />
              {errores.telefono && <small className="text-danger">{errores.telefono}</small>}
            </>
          ) : (
            <span>{competidor.telefono}</span>
          )}
        </div>

        {editando && (
          <button
            className="btn btn-success mt-3"
            disabled={!formularioValido}
            onClick={guardarCambios}
          >
            Guardar cambios
          </button>
        )}
      </div>

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-2">Unirme a un Club</h5>
          <p className="text-muted">Ingresa el c?digo de un club para solicitar ingreso.</p>
          <div className="d-flex flex-column flex-md-row gap-2 mb-3">
            <input
              className="form-control"
              placeholder="C?digo del club"
              value={codigoClub}
              onChange={(e) => setCodigoClub(e.target.value)}
            />
            <button className="btn btn-primary" onClick={solicitarClub}>
              Enviar solicitud
            </button>
          </div>

          <h6 className="fw-bold mb-2">Mis solicitudes</h6>
          {loadingSolicitudes ? (
            <div className="text-muted">Cargando...</div>
          ) : misSolicitudes.length === 0 ? (
            <div className="text-muted">No tienes solicitudes.</div>
          ) : (
            <div className="list-group">
              {misSolicitudes.map((s) => (
                <div key={s.idSolicitud} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{s.nombreClub}</div>
                    <div className="small text-muted">Estado: {s.estado}</div>
                  </div>
                  {s.estado === "PENDIENTE" && (
                    <button className="btn btn-outline-danger btn-sm" onClick={() => cancelarSolicitud(s.idSolicitud)}>
                      Cancelar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h5 className="fw-bold mb-2">Postulaci?n a Juez</h5>
          {loadingJuez ? (
            <div className="text-muted">Cargando estado...</div>
          ) : juezEstado && juezEstado.estado !== "RECHAZADO" ? (
            <div className="alert alert-info mb-0">
              Estado: <strong>{juezEstado.estado}</strong> | Licencia: <strong>{juezEstado.licencia}</strong>
            </div>
          ) : (
            <>
              <p className="text-muted">
                Si te aprueban como juez, pasar?s a ser agente libre y solo podr?s competir en individuales.
              </p>
              <div className="d-flex flex-column flex-md-row gap-2">
                <input
                  className="form-control"
                  placeholder="N?mero de licencia"
                  value={licencia}
                  onChange={(e) => setLicencia(e.target.value)}
                />
                <button className="btn btn-primary" onClick={postularJuez}>
                  Enviar solicitud
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .competidor-welcome {
          background: linear-gradient(135deg, #0ea5e9, #22c55e);
        }
      `}</style>
    </div>
  );
}
