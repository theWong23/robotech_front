import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../styles/CompetidorDashboard.css";

export default function CompetidorDashboard() {

  // =============================
  // ESTADOS
  // =============================
  const [competidor, setCompetidor] = useState(null);
  const [editando, setEditando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: ""
  });

  const [errores, setErrores] = useState({
    nombres: "",
    apellidos: "",
    telefono: ""
  });

  // =============================
  // AUTH
  // =============================
  const entidad = JSON.parse(localStorage.getItem("entidad"));
  const token = localStorage.getItem("token");
  const idCompetidor = entidad?.idCompetidor;

  if (!entidad || !idCompetidor || !token) {
    return <p>No autorizado</p>;
  }

  const hayErrores =
  errores.nombres ||
  errores.apellidos ||
  errores.telefono;

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
        telefono: res.data.telefono || ""
      });

    } catch (err) {
      console.error(err);
    }
  };

  // =============================
  // VALIDACIONES
  // =============================
  const validarNombreHumano = (texto) => {
    if (!texto) return "Campo obligatorio";

    const limpio = texto.trim();

    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(limpio)) {
      return "Solo letras y espacios";
    }

    const letras = limpio.replace(/\s+/g, "");
    if (letras.length < 5) {
      return "Debe tener al menos 5 letras";
    }

    const palabras = limpio.split(" ");
    for (let p of palabras) {
      if (p.length > 0 && p.length < 3) {
        return "Cada palabra mínimo 3 letras";
      }
    }

    if (!/[AEIOUÁÉÍÓÚaeiouáéíóú]/.test(limpio)) {
      return "Debe contener una vocal";
    }

    return "";
  };

  const cambiar = (e) => {
    const { name, value: raw } = e.target;
    let value = raw;
    let error = "";

    if (name === "telefono") {
      value = raw.replace(/\D/g, "").slice(0, 9);
      if (value.length !== 9) error = "Debe tener 9 dígitos";
    }

    if (name === "nombres" || name === "apellidos") {
      error = validarNombreHumano(value);
    }

    setForm(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: error }));
  };

  const claseInput = (campo) => {
    if (!editando) return "form-control";
    if (!form[campo]) return "form-control";
    return errores[campo]
      ? "form-control is-invalid"
      : "form-control is-valid";
  };


  // =============================
  // GUARDAR CAMBIOS
  // =============================
  const guardarCambios = async () => {
    const errNom = validarNombreHumano(form.nombres);
    const errApe = validarNombreHumano(form.apellidos);

    if (errNom || errApe || !/^[0-9]{9}$/.test(form.telefono)) {
      Swal.fire("Error", "Datos inválidos", "warning");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/competidores/${idCompetidor}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      Swal.fire("Perfil actualizado", "", "success");
      setEditando(false);
      cargarPerfil();

    } catch {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const cancelarEdicion = () => {
    setForm({
      nombres: competidor.nombres,
      apellidos: competidor.apellidos,
      telefono: competidor.telefono || ""
    });
    setErrores({ nombres: "", apellidos: "", telefono: "" });
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
  !errores.nombres &&
  !errores.apellidos &&
  !errores.telefono &&
  form.nombres &&
  form.apellidos &&
  form.telefono;

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

          <p className="perfil-club">
            Club: {competidor.clubNombre}
          </p>

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

        <div className="perfil-dato">
          <label>Correo</label>
          <span>{competidor.correo}</span>
        </div>

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
              {errores.nombres && (
                <small className="text-danger fade-edit">
                  {errores.nombres}
                </small>
              )}
            </>
          ) : (
            <span>{competidor.nombres}</span>
          )}
        </div>


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
              {errores.apellidos && (
                <small className="text-danger fade-edit">
                  {errores.apellidos}
                </small>
              )}
            </>
          ) : (
            <span>{competidor.apellidos}</span>
          )}
        </div>


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
              {errores.telefono && (
                <small className="text-danger">{errores.telefono}</small>
              )}
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
