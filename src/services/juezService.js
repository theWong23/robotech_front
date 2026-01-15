import api from "./axiosConfig";

// Función auxiliar para obtener ID con seguridad
const getAdminId = () => {
  const usuarioStr = localStorage.getItem("usuario");
  
  if (!usuarioStr) {
    console.error("❌ ERROR CRÍTICO: No hay usuario en localStorage");
    return null;
  }

  try {
    const usuario = JSON.parse(usuarioStr);
    
    // Buscamos el ID. Con el arreglo del Backend, ahora debería estar en "idUsuario"
    // Pero dejamos las otras opciones por seguridad.
    const id = usuario.idUsuario || usuario.id || (usuario.entidad && usuario.entidad.idUsuario);
    
    if (!id) {
        console.error("❌ ERROR: El usuario existe pero NO TIENE ID:", usuario);
    } else {
        console.log("✅ ID de Admin recuperado:", id);
    }
    return id;
  } catch (e) {
    console.error("❌ Error parseando usuario", e);
    return null;
  }
};

// 1. APROBAR JUEZ
export const aprobarJuez = async (idJuez) => {
  const adminId = getAdminId();

  if (!adminId) {
    alert("Error de Sesión: No se encuentra tu ID de administrador. Por favor cierra sesión y vuelve a entrar.");
    throw new Error("No Admin ID");
  }

  return api.put(
    `/admin/jueces/${idJuez}/aprobar`, 
    {}, // Body vacío
    {
      headers: {
        "admin-id": adminId // El header obligatorio
      }
    }
  );
};

// 2. RECHAZAR JUEZ
export const rechazarJuez = async (idJuez) => {
  const adminId = getAdminId();
  if (!adminId) throw new Error("No Admin ID");

  return api.put(
    `/admin/jueces/${idJuez}/rechazar`,
    {},
    {
      headers: { "admin-id": adminId }
    }
  );
};

// 3. LISTAR
export const listarJueces = async () => {
  return api.get("/admin/jueces");
};