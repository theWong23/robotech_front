import api from "./axiosConfig";

export const login = async (correo, contrasena) => {
  const res = await api.post("/api/auth/login", {
    correo,
    contrasena
  });

  const { token, usuario } = res.data;

  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));

  return usuario;
};

export const logout = () => {
  localStorage.clear();
};
