import { useEffect, useRef, useState } from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useParams } from "react-router-dom";
import { send } from "ionicons/icons";
import { useAuth } from "../../Hooks/useAuth";
import { sendMessage, subscribeToChat, subscribeToMessages } from "../../Helpers/chatService";
import { getChatDraft, saveChatDraft } from "../../Helpers/chatDraft";
import {
  formatChatTime,
  getOtherUid,
  MAX_MESSAGE_LENGTH,
  type Chat,
  type Message,
} from "../../Helpers/chats";
import styles from "./Chats.module.scss";

const ChatRoom = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const draftLoadedRef = useRef(false);

  useEffect(() => {
    if (!user || !chatId) return;
    draftLoadedRef.current = false;
    let active = true;
    getChatDraft(user.uid, chatId)
      .then((draft) => {
        if (active) setTexto(draft);
      })
      .catch((err) => console.error("Error al cargar el borrador:", err))
      .finally(() => {
        if (active) draftLoadedRef.current = true;
      });
    return () => {
      active = false;
    };
  }, [user, chatId]);

  const handleTextoChange = (value: string) => {
    setTexto(value);
    if (user && draftLoadedRef.current) {
      saveChatDraft(user.uid, chatId, value).catch((err) =>
        console.error("Error al guardar el borrador:", err)
      );
    }
  };

  useEffect(() => {
    if (!user || !chatId) return;

    const onError = (err: { code: string }) => {
      console.error("Error en el chat:", err);
      setError(
        err.code === "permission-denied"
          ? "No tienes acceso a este chat."
          : "No se pudo cargar la conversación."
      );
      setLoading(false);
    };

    const unsubChat = subscribeToChat(
      chatId,
      (data) => {
        if (!data) {
          setError("Este chat no existe.");
          setLoading(false);
          return;
        }
        setChat(data);
      },
      onError
    );
    const unsubMessages = subscribeToMessages(
      chatId,
      (list) => {
        setMessages(list);
        setLoading(false);
      },
      onError
    );

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [user, chatId]);

  useEffect(() => {
    contentRef.current?.scrollToBottom(200);
  }, [messages.length]);

  const handleSend = async () => {
    if (!user || !texto.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      await sendMessage(chatId, user.uid, texto);
      handleTextoChange("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setSendError(
        err instanceof Error && err.message.startsWith("El mensaje")
          ? err.message
          : "No se pudo enviar el mensaje. Intenta nuevamente."
      );
    } finally {
      setSending(false);
    }
  };

  const otherName = chat && user ? chat.nombres?.[getOtherUid(chat, user.uid)] ?? "Usuario" : "";

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className={styles.toolbar}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/chats" text="" />
          </IonButtons>
          <IonTitle className={styles.title}>
            {otherName || "Chat"}
            {chat?.jobTitulo && <span className={styles.subtitle}>{chat.jobTitulo}</span>}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} className={styles.content}>
        {loading && (
          <div className={styles.center}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {error && (
          <IonText color="danger">
            <p className={styles.center}>{error}</p>
          </IonText>
        )}

        {!loading && !error && messages.length === 0 && (
          <p className={styles.hint}>Escribe el primer mensaje para iniciar la conversación.</p>
        )}

        <div className={styles.messages}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${styles.bubble} ${m.autorUid === user?.uid ? styles.mine : styles.theirs}`}
            >
              <p>{m.texto}</p>
              <span>{formatChatTime(m.creadoEn)}</span>
            </div>
          ))}
        </div>
      </IonContent>

      {!error && (
        <IonFooter className="ion-no-border">
          {sendError && (
            <IonText color="danger">
              <p className={styles.sendError}>{sendError}</p>
            </IonText>
          )}
          <div className={styles.composer}>
            <IonTextarea
              className={styles.input}
              placeholder="Escribe un mensaje..."
              autoGrow
              rows={1}
              maxlength={MAX_MESSAGE_LENGTH}
              value={texto}
              disabled={loading}
              onIonInput={(e) => handleTextoChange(e.detail.value ?? "")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
            />
            <IonButton
              className={styles.sendBtn}
              shape="round"
              disabled={loading || sending || !texto.trim()}
              onClick={() => void handleSend()}
              aria-label="Enviar mensaje"
            >
              {sending ? <IonSpinner name="dots" /> : <IonIcon slot="icon-only" icon={send} />}
            </IonButton>
          </div>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default ChatRoom;
