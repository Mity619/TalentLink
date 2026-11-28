import { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { chatbubblesOutline, personCircleOutline } from "ionicons/icons";
import { useAuth } from "../../Hooks/useAuth";
import { subscribeToChats } from "../../Helpers/chatService";
import { formatChatTime, getOtherUid, type Chat } from "../../Helpers/chats";
import styles from "./Chats.module.scss";

const Chats = () => {
  const { user, profile } = useAuth();
  const history = useHistory();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    return subscribeToChats(
      user.uid,
      (list) => {
        setChats(list);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Error al cargar chats:", err);
        setError("No se pudieron cargar tus chats.");
        setLoading(false);
      }
    );
  }, [user]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className={styles.toolbar}>
          <IonTitle className={styles.title}>Mis Chats</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className={styles.content}>
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

        {!loading && !error && chats.length === 0 && (
          <div className={styles.empty}>
            <IonIcon icon={chatbubblesOutline} />
            <h3>Aún no tienes conversaciones</h3>
            <p>
              {profile?.rol === "student"
                ? "Desde una vacante, toca «Contactar» para escribirle al reclutador."
                : "Aquí aparecerán los mensajes que te envíen los estudiantes."}
            </p>
          </div>
        )}

        <div className={styles.list}>
          {user &&
            chats.map((chat) => {
              const otherName = chat.nombres?.[getOtherUid(chat, user.uid)] ?? "Usuario";
              const preview = chat.ultimoMensaje
                ? `${chat.ultimoAutor === user.uid ? "Tú: " : ""}${chat.ultimoMensaje}`
                : "Sin mensajes todavía";
              return (
                <button
                  key={chat.id}
                  type="button"
                  className={styles.chatItem}
                  onClick={() => history.push(`/app/chats/${chat.id}`)}
                >
                  <IonIcon icon={personCircleOutline} className={styles.avatar} />
                  <div className={styles.chatInfo}>
                    <div className={styles.chatTop}>
                      <strong>{otherName}</strong>
                      <span>{formatChatTime(chat.actualizadoEn)}</span>
                    </div>
                    {chat.jobTitulo && <span className={styles.jobTag}>{chat.jobTitulo}</span>}
                    <p>{preview}</p>
                  </div>
                </button>
              );
            })}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Chats;
