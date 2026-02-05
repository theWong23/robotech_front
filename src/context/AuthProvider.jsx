import { useState } from "react";
import AuthContext from "./AuthContext";

export default function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("usuario");
    try { return u ? JSON.parse(u) : null; }
    catch { return null; }
  });

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [roles, setRoles] = useState(() => {
    const r = localStorage.getItem("roles");
    try { return r ? JSON.parse(r) : []; }
    catch { return []; }
  });

  const [entidad, setEntidad] = useState(() => {
    const e = localStorage.getItem("entidad");
    try { return e ? JSON.parse(e) : null; }
    catch { return null; }
  });

  // LOGIN
  const login = (data) => {

    const normalizedUser = (() => {
      const ent = data.entidad || {};
      if (ent.club && ent.competidor) {
        const club = ent.club;
        const competidor = ent.competidor;
        return { ...club, ...competidor, club, competidor };
      }
      if (ent.competidor) return ent.competidor;
      if (ent.club) return ent.club;
      if (ent.juez) return ent.juez;
      if (ent.usuario) return ent.usuario;
      return data.usuario || null;
    })();

    const nextRoles = Array.isArray(data.roles) ? data.roles : (data.rol ? [data.rol] : []);

    setUser(normalizedUser);
    setToken(data.token);
    setRoles(nextRoles);
    setEntidad(data.entidad);

    localStorage.setItem("usuario", JSON.stringify(normalizedUser));
    localStorage.setItem("token", data.token);
    localStorage.setItem("roles", JSON.stringify(nextRoles));
    localStorage.setItem("entidad", JSON.stringify(data.entidad));
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setToken("");
    setRoles([]);
    setEntidad(null);

    localStorage.clear();

    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, token, roles, entidad, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
