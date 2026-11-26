import type { Timestamp } from "firebase/firestore";

export type EstadoPostulacion =
  | "pendiente"
  | "aceptada"
  | "rechazada";

export interface Application {
  id: string;
  jobId: string;
  uid: string;
  estado: EstadoPostulacion;
  creadoEn: Timestamp | null;
}

// Generar un identificador único para cada postulación.
export const getApplicationId = (
  jobId: string,
  uid: string
): string => {
  return `${jobId}_${uid}`;
};

export const estadoPostulacionLabel: Record<
  EstadoPostulacion,
  string
> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};
