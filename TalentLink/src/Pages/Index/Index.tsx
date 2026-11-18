import {
  IonButton,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../Hooks/useAuth";
import type { Rol } from "../../Helpers/validators";
import styles from "./Index.module.scss";

export const roleLabel: Record<Rol, string> = {
  student: "Estudiante",
  recruiter: "Reclutador",
  admin: "Administrador",
};

const Index = () => {
  const { profile } = useAuth();
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Inicio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className={styles.hero}>
          <h1>Hola, {profile?.nombre?.split(" ")[0] || "bienvenido"}</h1>
          <p>
            Sesión iniciada como <strong>{profile ? roleLabel[profile.rol] : "Usuario"}</strong>.
          </p>
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Mi perfil</h3>
            <p>Foto, nombre y habilidades.</p>
            <IonButton size="small" onClick={() => history.push("/app/profile")}>
              Abrir
            </IonButton>
          </div>

          {profile?.rol === "admin" && (
            <div className={styles.card}>
              <h3>Usuarios</h3>
              <p>Bloquear, cambiar rol o eliminar.</p>
              <IonButton size="small" onClick={() => history.push("/app/admin/users")}>
                Administrar
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Index;