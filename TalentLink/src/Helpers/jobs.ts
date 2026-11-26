
import type { Timestamp } from "firebase/firestore";

export type Modalidad = "presencial" | "remoto" | "hibrido";

export type EstadoVacante = "activa" | "cerrada";

export interface JobInput {
  titulo: string;
  descripcion: string;
  empresa: string;
  area: string;
  modalidad: Modalidad;
  ciudad: string;
  lat: number | null;
  lng: number | null;
}

export interface Job extends JobInput {
  id: string;
  autorUid: string;
  estado: EstadoVacante;
  creadoEn: Timestamp | null;
}

export const modalidadLabel: Record<Modalidad, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};
