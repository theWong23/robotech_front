import api from "./axiosConfig";

export const consultarDni = async (dni) => {
  const res = await api.get(`/util/dni/${dni}`);

  if (res.data.code !== "200") {
    throw new Error("DNI no encontrado");
  }

  return {
    nombres: res.data.nombres,
    apellidos: `${res.data.apellido_paterno} ${res.data.apellido_materno}`
  };
};