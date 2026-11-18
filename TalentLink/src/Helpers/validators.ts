export type Rol = "student" | "recruiter" | "admin";

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
  confirm: string;
  rol: "student" | "recruiter";
}

export interface ProfileInput {
  nombre: string;
  habilidades: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const isEmail = (v = ""): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const isPassword = (v = ""): boolean => v.length >= 6;
export const isName = (v = ""): boolean => v.trim().length >= 3;

export const parseSkills = (texto = ""): string[] =>
  texto.split(",").map((h) => h.trim()).filter(Boolean).slice(0, 15);

export const validateRegister = (data: RegisterInput): FieldErrors<RegisterInput> => {
  const errors: FieldErrors<RegisterInput> = {};
  if (!isName(data.nombre)) errors.nombre = "Mínimo 3 caracteres.";
  if (!isEmail(data.email)) errors.email = "Correo inválido.";
  if (!isPassword(data.password)) errors.password = "Mínimo 6 caracteres.";
  if (data.password !== data.confirm) errors.confirm = "Las contraseñas no coinciden.";
  if (!["student", "recruiter"].includes(data.rol)) errors.rol = "Selecciona un rol.";
  return errors;
};

export const validateProfile = (data: ProfileInput): FieldErrors<ProfileInput> => {
  const errors: FieldErrors<ProfileInput> = {};
  if (!isName(data.nombre)) errors.nombre = "Mínimo 3 caracteres.";
  if (parseSkills(data.habilidades).length > 15)
    errors.habilidades = "Máximo 15 habilidades.";
  return errors;
};

export const roleLabel: Record<Rol, string> = {
  student: "Estudiante",
  recruiter: "Reclutador",
  admin: "Administrador",
};