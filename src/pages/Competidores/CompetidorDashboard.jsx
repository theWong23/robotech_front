import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. IMPORTAR useNavigate
import axios from "axios";
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
  const token = localStorage.getItem("token");
  const idCompetidor = entidad?.idCompetidor;

  if (!entidad || !idCompetidor || !token) {
    return <p>No autorizado. Inicia sesión nuevamente.</p>;
  }

  // =============================
  // CARGAR PERFIL
  // =============================
  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/competidores/${idCompetidor}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

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
      await axios.put(
        `http://localhost:8080/api/competidores/${idCompetidor}`,
        form, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

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
      await axios.post(
        `http://localhost:8080/api/competidores/${idCompetidor}/foto`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
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
    </div>
  );
}