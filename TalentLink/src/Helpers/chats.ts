import type { Timestamp } from "firebase/firestore";

export const MAX_MESSAGE_LENGTH = 1000;

export interface Chat {
  id: string;
  participantes: string[];
  nombres: Record<string, string>;
  ultimoMensaje: string;
  ultimoAutor: string;
  actualizadoEn: Timestamp | null;
  jobId: string | null;
  jobTitulo: string | null;
}

export interface Message {
  id: string;
  texto: string;
  autorUid: string;
  creadoEn: Timestamp | null;
}

// Un chat por pareja de usuarios: el ID no depende de quién lo abre.
export const getChatId = (uidA: string, uidB: string): string =>
  [uidA, uidB].sort().join("_");

export const getOtherUid = (chat: Chat, uid: string): string =>
  chat.participantes.find((p) => p !== uid) ?? uid;

export const formatChatTime = (ts: Timestamp | null): string => {
  if (!ts) return "";
  const date = ts.toDate();
  const now = new Date();
  return date.toDateString() === now.toDateString()
    ? date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" });
};
