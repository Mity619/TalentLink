import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  // Si ctx es null, lanzamos un error. TypeScript ahora sabe que el retorno no es null.
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};