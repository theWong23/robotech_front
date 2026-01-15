import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig"; // 👈 ÚNICO CAMBIO: Corregido para que cargue

export default function Clubes() {
  const [busqueda, setBusqueda] = useState("");
  const [clubes, setClubes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [emailSuggestionsField, setEmailSuggestionsField] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    correoContacto: "",
    telefonoContacto: "",
    direccionFiscal: "",
    nombresPropietario: "",
    apellidosPropietario: "",
    correoPropietario: "",
    telefonoPropietario: "",
    contrasenaPropietario: ""
  });

  // =========================
  // Helpers
  // =========================
  const esEmailValido = (email) =>
    /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test((email || "").trim());

  const esCelularPeruValido = (tel) =>
    /^9\d{8}$/.test((tel || "").trim());

  const normalizarEmail = (email) => (email || "").trim().toLowerCase();

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const toast = (title, text, icon = "info") =>
    Swal.fire({ title, text, icon });

  const mostrarErroresPorCampo = async (obj) => {
    const mensajes = Object.entries(obj)
      .map(([campo, msg]) => `• <b>${campo}</b>: ${msg}`)
      .join("<br/>");

    await Swal.fire({
      icon: "error",
      title: "Revisa el formulario",
      html: mensajes
    });
  };

  // Si backend devuelve ApiErrorDTO:
  // { code, message, fieldErrors, suggestions }
  const manejarErrorApi = async (err) => {
    const status = err.response?.status;
    const data = err.response?.data;

    // console debug (puedes borrarlo luego)
    console.log("STATUS:", status);
    console.log("DATA:", data);

    // Backend manda string plano
    if (typeof data === "string") {
      await Swal.fire("Error", data, "error");
      return;
    }

    // Si viene el formato ApiErrorDTO
    const code = data?.code;
    const message = data?.message;
    const fieldErrors = data?.fieldErrors;
    const suggestions = data?.suggestions;

    // 1) EMAIL_TAKEN con sugerencias
    if (data?.code === "EMAIL_TAKEN") {
      const field = data?.fieldErrors?.field; // "correoContacto" o "correoPropietario"
      setEmailSuggestionsField(field);
      setEmailSuggestions(data.suggestions || []);
      Swal.fire("Correo en uso", data.message, "warning");
      return;
    }


    // 2) Errores por campo (puede venir como { campo: msg } o como ApiErrorDTO.fieldErrors)
    if (fieldErrors && typeof fieldErrors === "object") {
      await mostrarErroresPorCampo(fieldErrors);
      return;
    }
    if (data && typeof data === "object" && !Array.isArray(data) && !code) {
      // Caso viejo: map directo { campo: msg }
      await mostrarErroresPorCampo(data);
      return;
    }

    // 3) Mensaje genérico
    await Swal.fire("Error", message || "Ocurrió un error", "error");
  };

  // =========================
  // Cargar clubes
  // =========================
  useEffect(() => {
    cargarClubes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  const cargarClubes = async () => {
    try {
      setLoading(true);
      // axiosConfig ya tiene /api, así que la ruta es /admin/clubes
      const res = await api.get("/admin/clubes", {
        params: { nombre: busqueda }
      });
      setClubes(res.data);
    } catch {
      toast("Error", "No se pudo cargar los clubes", "error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Modal crear
  // =========================
  const abrirModal = () => {
    setEmailSuggestions([]);
    setForm({
      nombre: "",
      correoContacto: "",
      telefonoContacto: "",
      direccionFiscal: "",
      nombresPropietario: "",
      apellidosPropietario: "",
      correoPropietario: "",
      telefonoPropietario: "",
      contrasenaPropietario: ""
    });
    setModalOpen(true);
  };

  const validarAntesDeEnviar = () => {
    // requeridos
    const req = [
      ["nombre", "Nombre del club"],
      ["correoContacto", "Correo de contacto"],
      ["telefonoContacto", "Teléfono de contacto"],
      ["nombresPropietario", "Nombres del propietario"],
      ["apellidosPropietario", "Apellidos del propietario"],
      ["correoPropietario", "Correo del propietario"],
      ["telefonoPropietario", "Teléfono del propietario"],
      ["contrasenaPropietario", "Contraseña"]
    ];

    const faltantes = req
      .filter(([k]) => !String(form[k] || "").trim())
      .map(([, label]) => label);

    if (faltantes.length) {
      toast("Campos incompletos", `Completa: ${faltantes.join(", ")}`, "warning");
      return false;
    }

    // emails
    if (!esEmailValido(form.correoContacto) || !esEmailValido(form.correoPropietario)) {
      toast("Correo inválido", "Revisa el formato del correo", "warning");
      return false;
    }

    // celulares Perú
    if (!esCelularPeruValido(form.telefonoContacto) || !esCelularPeruValido(form.telefonoPropietario)) {
      toast("Celular inválido", "Debe tener 9 dígitos y empezar con 9", "warning");
      return false;
    }

    return true;
  };

  const crearClub = async () => {
    setEmailSuggestions([]);

    if (!validarAntesDeEnviar()) return;

    // normaliza emails antes de enviar (buena práctica)
    const payload = {
      ...form,
      correoContacto: normalizarEmail(form.correoContacto),
      correoPropietario: normalizarEmail(form.correoPropietario)
    };

    try {
      await api.post("/admin/clubes", payload);
      await Swal.fire("✔ Club creado", "El club fue registrado correctamente", "success");
      setModalOpen(false);
      cargarClubes();
    } catch (err) {
      await manejarErrorApi(err);
    }
  };

  // =========================
  // Editar club
  // =========================
  const guardarClub = async () => {
    try {
      await api.put(`/admin/clubes/${editando.idClub}`, editando);
      Swal.fire("✔ Club actualizado", "", "success");
      setEditando(null);
      cargarClubes();
    } catch (err) {
      await manejarErrorApi(err);
    }
  };

  // =========================
  // Activar / Desactivar
  // =========================
  const cambiarEstado = async (club) => {
    const nuevoEstado = club.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";

    const confirm = await Swal.fire({
      title: `${nuevoEstado === "ACTIVO" ? "Activar" : "Desactivar"} club`,
      text: `¿Seguro que deseas ${nuevoEstado.toLowerCase()} este club?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/admin/clubes/${club.idClub}`, {
        ...club,
        estado: nuevoEstado
      });

      await Swal.fire("✔ Estado actualizado", "", "success");
      cargarClubes();
    } catch (err) {
      await manejarErrorApi(err);
    }
  };

  // =========================
  // UI: chips suggestions
  // =========================
  const suggestionsVisible = useMemo(
    () => Array.isArray(emailSuggestions) && emailSuggestions.length > 0,
    [emailSuggestions]
  );

  // =========================
  // Render
  // =========================
  return (
    <div className="p-4">
      <h2 className="fw-bold mb-3">Gestión de Clubes</h2>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        className="form-control mb-3"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <button className="btn btn-primary mb-4" onClick={abrirModal} disabled={loading}>
        ➕ Crear Nuevo Club
      </button>

      <table className="table table-bordered align-middle">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th style={{ width: 220 }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
          ) : clubes.length === 0 ? (
            <tr><td colSpan="5" className="text-center">No se encontraron clubes</td></tr>
          ) : (
            clubes.map((c) => (
              <tr key={c.idClub}>
                <td>{c.nombre}</td>
                <td>{c.correoContacto}</td>
                <td>{c.telefonoContacto}</td>
                <td>
                  <span className={`badge bg-${c.estado === "ACTIVO" ? "success" : "danger"}`}>
                    {c.estado}
                  </span>
                </td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => setEditando({ ...c })}>
                    Editar
                  </button>

                  <button
                    className={`btn btn-${c.estado === "ACTIVO" ? "danger" : "success"} btn-sm`}
                    onClick={() => cambiarEstado(c)}
                  >
                    {c.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= MODAL CREAR ================= */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <h4 className="fw-bold mb-3">Registrar Club</h4>

              <input
                className="form-control mb-2"
                placeholder="Nombre del club"
                value={form.nombre}
                onChange={(e) => setField("nombre", e.target.value)}
              />

              <input
                className="form-control mb-2"
                placeholder="Correo de contacto"
                value={form.correoContacto}
                onChange={(e) => {
                  setField("correoContacto", e.target.value);
                  if (emailSuggestionsField === "correoContacto") {
                    setEmailSuggestions([]);
                    setEmailSuggestionsField(null);
                  }
                }}
              />
              {suggestionsVisible && emailSuggestionsField === "correoContacto" && (
                  <div className="mb-2">
                    <small className="text-muted">Sugerencias disponibles:</small>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {emailSuggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            setField("correoContacto", s);
                            setEmailSuggestions([]);
                            setEmailSuggestionsField(null);
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}



              <input
                className="form-control mb-2"
                placeholder="Teléfono de contacto (Perú: 9xxxxxxxx)"
                value={form.telefonoContacto}
                onChange={(e) =>
                  setField("telefonoContacto", e.target.value.replace(/\D/g, "").slice(0, 9))
                }
              />

              <input
                className="form-control mb-2"
                placeholder="Dirección fiscal"
                value={form.direccionFiscal}
                onChange={(e) => setField("direccionFiscal", e.target.value)}
              />

              <hr />
              <h6 className="fw-bold">Datos del propietario</h6>

              <input
                className="form-control mb-2"
                placeholder="Nombres"
                value={form.nombresPropietario}
                onChange={(e) => setField("nombresPropietario", e.target.value)}
              />

              <input
                className="form-control mb-2"
                placeholder="Apellidos"
                value={form.apellidosPropietario}
                onChange={(e) => setField("apellidosPropietario", e.target.value)}
              />

              <input
                className="form-control mb-2"
                placeholder="Correo del propietario"
                value={form.correoPropietario}
                onChange={(e) => {
                  setField("correoPropietario", e.target.value);
                  if (emailSuggestionsField === "correoPropietario") {
                    setEmailSuggestions([]);
                    setEmailSuggestionsField(null);
                  }
                }}
              />
              {suggestionsVisible && emailSuggestionsField === "correoPropietario" && (
                <div className="mb-2">
                  <small className="text-muted">Sugerencias disponibles:</small>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {emailSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          setField("correoPropietario", s);
                          setEmailSuggestions([]);
                          setEmailSuggestionsField(null);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}


              {/* ✅ CHIPS DE SUGERENCIAS */}
              {suggestionsVisible && (
                <div className="mb-2">
                  <small className="text-muted">Sugerencias disponibles:</small>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {emailSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => {
                          setField("correoPropietario", s);
                          setEmailSuggestions([]);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <input
                className="form-control mb-2"
                placeholder="Teléfono del propietario (Perú: 9xxxxxxxx)"
                value={form.telefonoPropietario}
                onChange={(e) =>
                  setField("telefonoPropietario", e.target.value.replace(/\D/g, "").slice(0, 9))
                }
              />

              <input
                className="form-control mb-3"
                type="password"
                placeholder="Contraseña"
                value={form.contrasenaPropietario}
                onChange={(e) => setField("contrasenaPropietario", e.target.value)}
              />

              <div className="text-end">
                <button className="btn btn-secondary me-2" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={crearClub}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL EDITAR ================= */}
      {editando && (
        <div className="modal fade show d-block" style={{ background: "#0008" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <h4 className="fw-bold mb-3">Editar Club</h4>

              <input
                className="form-control mb-2"
                value={editando.nombre}
                onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
              />

              <input
                className="form-control mb-2"
                value={editando.correoContacto}
                onChange={(e) => setEditando({ ...editando, correoContacto: e.target.value })}
              />

              <input
                className="form-control mb-2"
                value={editando.telefonoContacto}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    telefonoContacto: e.target.value.replace(/\D/g, "").slice(0, 9)
                  })
                }
              />

              <select
                className="form-select mb-3"
                value={editando.estado}
                onChange={(e) => setEditando({ ...editando, estado: e.target.value })}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>

              <div className="text-end">
                <button className="btn btn-secondary me-2" onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={guardarClub}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}