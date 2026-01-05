import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Register() {

  const validarNombreHumano = (texto) => {
    if (!texto) return "Este campo es obligatorio.";

  const limpio = texto.trim();

  // Solo letras y espacios
  if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(limpio)) {
    return "Solo se permiten letras y espacios.";
  }

  // Mínimo 5 letras totales (sin contar espacios)
  const letras = limpio.replace(/\s+/g, "");
  if (letras.length < 5) {
    return "Debe tener al menos 5 letras.";
  }

  // Cada palabra mínimo 3 letras (Juan, María, Carlos)
  const palabras = limpio.split(" ");
  for (let p of palabras) {
    if (p.length > 0 && p.length < 3) {
      return "Cada nombre debe tener al menos 3 letras.";
    }
  }

  // Debe contener al menos una vocal
  if (!/[AEIOUÁÉÍÓÚaeiouáéíóú]/.test(limpio)) {
    return "Debe contener al menos una vocal.";
  }

  return ""; 
};

  // Paso 1 → validar código
  const [codigo, setCodigo] = useState("");
  const [codigoValido, setCodigoValido] = useState(false);
  const [club, setClub] = useState(null);

  // Paso 2 → datos del competidor (controlled form)
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    correo: "",
    telefono: "",
    contrasena: "",
  });

  // Errores en vivo por campo
  const [errores, setErrores] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    correo: "",
    telefono: "",
    contrasena: "",
  });

  const [mostrarContra, setMostrarContra] = useState(false);

  // función de cambio centralizada con validaciones en vivo
  const cambiar = (e) => {
    const { name, value: rawValue } = e.target;
    let value = rawValue;
    let msg = "";

    // Normalizaciones/sanitizaciones
    if (name === "dni") {
      // solo dígitos, máximo 8
      value = rawValue.replace(/\D/g, "").slice(0, 8);
      if (value.length > 0 && value.length < 8) msg = "El DNI debe tener 8 dígitos.";
      if (value.length === 0) msg = "El DNI es obligatorio.";
    }

    if (name === "telefono") {
      // solo dígitos, máximo 9
      value = rawValue.replace(/\D/g, "").slice(0, 9);
      if (value.length > 0 && value.length < 9) msg = "El teléfono debe tener 9 dígitos.";
      if (value.length === 0) msg = "El teléfono es obligatorio.";
    }

    if (name === "nombres" || name === "apellidos") {
      msg = validarNombreHumano(value);
    }

    if (name === "correo") {
      if (value) {
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexCorreo.test(value)) msg = "Formato de correo inválido.";
      } else {
        msg = "El correo es obligatorio.";
      }
    }

    if (name === "contrasena") {
      // Reglas: mínimo 8, mayúscula, número, símbolo
      const reglas = [];
      if (value.length < 8) reglas.push("mínimo 8 caracteres");
      if (!/[A-Z]/.test(value)) reglas.push("una mayúscula");
      if (!/[0-9]/.test(value)) reglas.push("un número");
      if (!/[!@#$%^&*.,?]/.test(value)) reglas.push("un símbolo (ej. !@#)");
      msg = reglas.length > 0 ? `Falta: ${reglas.join(", ")}` : "";
    }

    // Actualizar estado del formulario y errores
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: msg }));
  };

  // 🔥 VALIDAR CÓDIGO
  const validarCodigo = async () => {
    if (!codigo) {
      Swal.fire("Código vacío", "Ingresa un código primero", "warning");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/api/codigos/validar/${codigo}`);

      Swal.fire({
        icon: "success",
        title: "Código válido 🎉",
        text: `Perteneces al club: ${res.data.club.nombre}`
      });

      setClub(res.data.club);
      setCodigoValido(true);

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Código inválido ❌",
        text: err.response?.data || "Este código no existe, expiró o ya fue usado"
      });
    }
  };

  // REGISTRAR COMPETIDOR
  const registrar = async (e) => {
    e.preventDefault();

    // VALIDACIONES FINALES (reafirmar)
    // nombres/apellidos
    const errorNombre = validarNombreHumano(form.nombres);
    if (errorNombre) {
      Swal.fire("Nombre inválido", errorNombre, "warning");
      return;
    }

    const errorApellido = validarNombreHumano(form.apellidos);
    if (errorApellido) {
      Swal.fire("Apellido inválido", errorApellido, "warning");
      return;
    }

    // DNI: solo números y 8 dígitos
    if (!/^[0-9]{8}$/.test(form.dni)) {
      Swal.fire("DNI inválido", "Debe contener exactamente 8 números.", "warning");
      return;
    }

    // Correo formato válido
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(form.correo)) {
      Swal.fire("Correo inválido", "Ingresa un correo electrónico válido.", "warning");
      return;
    }

    // Teléfono: 9 números
    if (!/^[0-9]{9}$/.test(form.telefono)) {
      Swal.fire("Teléfono inválido", "Debe tener 9 números.", "warning");
      return;
    }

    // Contraseña: reglas estrictas (coherente con checklist)
    if (
      form.contrasena.length < 8 ||
      !/[A-Z]/.test(form.contrasena) ||
      !/[0-9]/.test(form.contrasena) ||
      !/[!@#$%^&*.,?]/.test(form.contrasena)
    ) {
      Swal.fire("Contraseña inválida", "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un símbolo.", "warning");
      return;
    }

    try {
      const payload = {
        nombre: form.nombres,
        apellido: form.apellidos,
        dni: form.dni,
        correo: form.correo,
        telefono: form.telefono,
        contrasena: form.contrasena,
        codigoClub: codigo      // 👈 el club viene del código
      };

      await axios.post("http://localhost:8080/api/auth/registro/competidor", payload);

      Swal.fire({
        icon: "success",
        title: "Registro enviado ✔",
        text: "El club debe aprobar tu solicitud."
      }).then(() => {
        window.location.href = "/login";
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data || "No se pudo registrar", "error");
    }
  };

  return (
    <div className="container mt-5">

      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#00b3b3" }}>
        <div className="container">
          <a className="navbar-brand" href="/">
            <img src="/img/logo.jpg" alt="Logo" height="50" />
          </a>
        </div>
      </nav>

      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "550px" }}>

        <h2 className="text-center text-primary fw-bold">Registro de Competidor</h2>

        {/* PASO 1: VALIDAR CÓDIGO */}
        {!codigoValido && (
          <div className="mt-3">
            <label>Código de Registro del Club</label>
            <input
              className="form-control mb-3"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ingresa tu código"
            />

            <button className="btn btn-primary w-100" onClick={validarCodigo}>
              Validar Código
            </button>
          </div>
        )}

        {/* PASO 2: MOSTRAR FORMULARIO */}
        {codigoValido && (
          <form onSubmit={registrar} className="mt-4">

            <div className="alert alert-info text-center">
              Registrando para <b>{club?.nombre}</b>
            </div>

            <label>Nombres</label>
            <input
              className={`form-control ${errores.nombres ? "is-invalid" : form.nombres ? "is-valid" : ""}`}
              name="nombres"
              value={form.nombres}
              onChange={cambiar}
              required
            />
            <div className="invalid-feedback">{errores.nombres}</div>

            <label className="mt-2">Apellidos</label>
            <input
              className={`form-control ${errores.apellidos ? "is-invalid" : form.apellidos ? "is-valid" : ""}`}
              name="apellidos"
              value={form.apellidos}
              onChange={cambiar}
              required
            />
            <div className="invalid-feedback">{errores.apellidos}</div>

            <label className="mt-2">DNI</label>
            <input
              className={`form-control ${errores.dni ? "is-invalid" : form.dni.length === 8 ? "is-valid" : ""}`}
              name="dni"
              value={form.dni}
              onChange={cambiar}
              maxLength="8"
              required
            />
            <div className="invalid-feedback">{errores.dni}</div>

            <label className="mt-2">Correo electrónico</label>
            <input
              className={`form-control ${errores.correo ? "is-invalid" : form.correo ? "is-valid" : ""}`}
              name="correo"
              value={form.correo}
              onChange={cambiar}
              required
            />
            <div className="invalid-feedback">{errores.correo}</div>

            <label className="mt-2">Teléfono</label>
            <input
              className={`form-control ${errores.telefono ? "is-invalid" : form.telefono.length === 9 ? "is-valid" : ""}`}
              name="telefono"
              value={form.telefono}
              onChange={cambiar}
              maxLength="9"
              required
            />
            <div className="invalid-feedback">{errores.telefono}</div>

            <label className="mt-2">Contraseña</label>
            <div className="input-group">
              <input
                type={mostrarContra ? "text" : "password"}
                className={`form-control ${errores.contrasena ? "is-invalid" : form.contrasena ? "is-valid" : ""}`}
                name="contrasena"
                value={form.contrasena}
                onChange={cambiar}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setMostrarContra(!mostrarContra)}
              >
                {mostrarContra ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Checklist (visual) */}
            <ul className="mt-2 small mb-0" style={{ listStyle: "none", paddingLeft: 0 }}>
              <li style={{ color: form.contrasena.length >= 8 ? "green" : "red" }}>
                {form.contrasena.length >= 8 ? "✔" : "•"} Mínimo 8 caracteres
              </li>
              <li style={{ color: /[A-Z]/.test(form.contrasena) ? "green" : "red" }}>
                {/[A-Z]/.test(form.contrasena) ? "✔" : "•"} Incluye una mayúscula
              </li>
              <li style={{ color: /[0-9]/.test(form.contrasena) ? "green" : "red" }}>
                {/[0-9]/.test(form.contrasena) ? "✔" : "•"} Incluye un número
              </li>
              <li style={{ color: /[!@#$%^&*.,?]/.test(form.contrasena) ? "green" : "red" }}>
                {/[!@#$%^&*.,?]/.test(form.contrasena) ? "✔" : "•"} Incluye un símbolo (! @ # $ ...)
              </li>
            </ul>
            <div className="invalid-feedback d-block">{errores.contrasena}</div>

            <button className="btn btn-success w-100 mt-3">Registrarme</button>
          </form>
        )}

      </div>
    </div>
  );
}
