import { IonContent, IonPage, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { personOutline, chatbubbleOutline, briefcaseOutline, shieldCheckmarkOutline } from "ionicons/icons";
import { useAuth } from "../../Hooks/useAuth";
import { roleLabel } from "../../Helpers/validators";
import styles from "./Index.module.scss";

const Index = () => {
  const { profile, logout } = useAuth(); // <-- Agregamos logout
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className={styles.headerArea}>
          <div className={styles.topRow}>
            <span className={styles.badge}>{profile ? roleLabel[profile.rol] : "Usuario"}</span>
            <span className={styles.logout} onClick={logout}>Salir</span> {/* <-- Botón funcional */}
          </div>
          
          <div className={styles.greeting}>
            <div className={styles.avatar}>{profile?.nombre?.charAt(0) || "U"}</div>
            <div>
              <p>Hola,</p>
              <h1>{profile?.nombre?.split(" ")[0]}</h1>
            </div>
          </div>
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.card} onClick={() => history.push("/app/profile")}>
            <IonIcon icon={personOutline} className={styles.icon} />
            <h3>Mi Perfil</h3>
            <p>Foto y habilidades</p>
          </div>
          
          <div className={styles.card} onClick={() => history.push("/app/chats")}>
            <IonIcon icon={chatbubbleOutline} className={styles.icon} />
            <h3>Mis Chats</h3>
            <p>Conversaciones</p>
          </div>

          <div className={styles.card} onClick={() => history.push("/app/jobs")}>
            <IonIcon icon={briefcaseOutline} className={styles.icon} />
            <h3>Vacantes</h3>
            <p>Explora ofertas</p>
          </div>

          {profile?.rol === "admin" && (
            <div className={`${styles.card} ${styles.adminCard}`} onClick={() => history.push("/admin/users")}>
              <IonIcon icon={shieldCheckmarkOutline} className={styles.adminIcon} />
              <h3>Panel de Administración</h3>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
export default Index;