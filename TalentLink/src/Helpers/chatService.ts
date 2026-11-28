import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { getChatId, MAX_MESSAGE_LENGTH, type Chat, type Message } from "./chats";

const chatsCollection = collection(db, "chats");
const messagesCollection = (chatId: string) => collection(db, "chats", chatId, "messages");

interface ChatUser {
  uid: string;
  nombre: string;
}

const getUserName = async (uid: string, fallback: string): Promise<string> => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return (snap.exists() && (snap.data().nombre as string)) || fallback;
  } catch {
    return fallback;
  }
};

export const openChat = async (
  me: ChatUser,
  otherUid: string,
  otherFallbackName: string,
  job?: { id: string; titulo: string }
): Promise<string> => {
  if (!otherUid || otherUid === me.uid) {
    throw new Error("No puedes iniciar un chat contigo mismo.");
  }

  const chatId = getChatId(me.uid, otherUid);
  const chatRef = doc(chatsCollection, chatId);
  const snap = await getDoc(chatRef);
  if (snap.exists()) return chatId;

  const otherName = await getUserName(otherUid, otherFallbackName);
  await setDoc(chatRef, {
    participantes: [me.uid, otherUid].sort(),
    nombres: { [me.uid]: me.nombre, [otherUid]: otherName },
    ultimoMensaje: "",
    ultimoAutor: "",
    actualizadoEn: serverTimestamp(),
    jobId: job?.id ?? null,
    jobTitulo: job?.titulo ?? null,
  });
  return chatId;
};

export const subscribeToChats = (
  uid: string,
  onChange: (chats: Chat[]) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe =>
  // Se ordena en el cliente para no depender de un índice compuesto.
  onSnapshot(
    query(chatsCollection, where("participantes", "array-contains", uid)),
    (snap) => {
      const chats = snap.docs.map(
        (d) => ({ ...d.data({ serverTimestamps: "estimate" }), id: d.id }) as Chat
      );
      chats.sort(
        (a, b) => (b.actualizadoEn?.toMillis() ?? 0) - (a.actualizadoEn?.toMillis() ?? 0)
      );
      onChange(chats);
    },
    onError
  );

export const subscribeToChat = (
  chatId: string,
  onChange: (chat: Chat | null) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe =>
  onSnapshot(
    doc(chatsCollection, chatId),
    (snap) => onChange(snap.exists() ? ({ ...snap.data(), id: snap.id } as Chat) : null),
    onError
  );

export const subscribeToMessages = (
  chatId: string,
  onChange: (messages: Message[]) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe =>
  onSnapshot(
    query(messagesCollection(chatId), orderBy("creadoEn", "asc")),
    (snap) =>
      onChange(
        snap.docs.map(
          (d) => ({ ...d.data({ serverTimestamps: "estimate" }), id: d.id }) as Message
        )
      ),
    onError
  );

export const sendMessage = async (chatId: string, autorUid: string, texto: string) => {
  const clean = texto.trim();
  if (!clean) return;
  if (clean.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.`);
  }

  const batch = writeBatch(db);
  batch.set(doc(messagesCollection(chatId)), {
    texto: clean,
    autorUid,
    creadoEn: serverTimestamp(),
  });
  batch.update(doc(chatsCollection, chatId), {
    ultimoMensaje: clean.slice(0, 120),
    ultimoAutor: autorUid,
    actualizadoEn: serverTimestamp(),
  });
  await batch.commit();
};
