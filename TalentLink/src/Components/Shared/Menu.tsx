import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  homeOutline,
  logOutOutline,
  peopleOutline,
  personCircleOutline,
} from "ionicons/icons";
import { useAuth } from "../../Hooks/useAuth";
import styles from "./Menu.module.scss";

const Menu = () => {
  const { profile, logout } = useAuth();
  const isAdmin = profile?.rol === "admin";

  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>TalentLink</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.userBox}>
          <img
            src={profile?.fotoURL || "https://ionicframework.com/docs/img/demos/avatar.svg"}
            alt="avatar"
            className={styles.avatar}
          />
          <p className={styles.name}>{profile?.nombre || "Usuario"}</p>
          <span className={styles.role}>{profile?.rol}</span>
        </div>

        <IonList>
          <IonListHeader>General</IonListHeader>
          <IonMenuToggle autoHide>
            <IonItem routerLink="/app/index" routerDirection="root" lines="none">
              <IonIcon slot="start" icon={homeOutline} />
              <IonLabel>Inicio</IonLabel>
            </IonItem>
            <IonItem routerLink="/app/profile" routerDirection="root" lines="none">
              <IonIcon slot="start" icon={personCircleOutline} />
              <IonLabel>Mi perfil</IonLabel>
            </IonItem>
            {/* Laura: vacantes
            <IonItem routerLink="/app/jobs" routerDirection="root" lines="none">
              <IonIcon slot="start" icon={briefcaseOutline} />
              <IonLabel>Vacantes</IonLabel>
            </IonItem>
            */}
          </IonMenuToggle>

          {isAdmin && (
            <>
              <IonListHeader>Administración</IonListHeader>
              <IonMenuToggle autoHide>
                <IonItem routerLink="/app/admin/users" routerDirection="root" lines="none">
                  <IonIcon slot="start" icon={peopleOutline} />
                  <IonLabel>Usuarios</IonLabel>
                </IonItem>
              </IonMenuToggle>
            </>
          )}

          <IonListHeader>Sesión</IonListHeader>
          <IonMenuToggle autoHide>
            <IonItem button onClick={logout} lines="none">
              <IonIcon slot="start" icon={logOutOutline} color="danger" />
              <IonLabel color="danger">Cerrar sesión</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;