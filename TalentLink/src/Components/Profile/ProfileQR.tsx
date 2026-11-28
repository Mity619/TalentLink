import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { QRCodeSVG } from "qrcode.react";
import type { UserProfile } from "../../Context/AuthContext";
import { roleLabel } from "../../Helpers/validators";
import styles from "./ProfileQR.module.scss";

const buildProfileQrText = (profile: UserProfile): string =>
  [
    "TalentLink",
    `Nombre: ${profile.nombre}`,
    `Correo: ${profile.email}`,
    `Rol: ${roleLabel[profile.rol]}`,
    profile.habilidades?.length ? `Habilidades: ${profile.habilidades.join(", ")}` : "",
    profile.cvURL ? `Hoja de vida: ${profile.cvURL}` : "",
  ]
    .filter(Boolean)
    .join("\n");

interface Props {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
}

const ProfileQR = ({ isOpen, profile, onClose }: Props) => (
  <IonModal isOpen={isOpen} onDidDismiss={onClose}>
    <IonHeader className="ion-no-border">
      <IonToolbar className={styles.toolbar}>
        <IonTitle className={styles.title}>Mi código QR</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={onClose}>Cerrar</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className={styles.content}>
      <div className={styles.card}>
        <div className={styles.qr}>
          <QRCodeSVG
            value={buildProfileQrText(profile)}
            size={240}
            level="M"
            marginSize={2}
            fgColor="#1a1a1a"
            title={`Código QR del perfil de ${profile.nombre}`}
          />
        </div>
        <h3>{profile.nombre}</h3>
        <p className={styles.role}>{roleLabel[profile.rol]}</p>
        <p className={styles.hint}>
          Al escanearlo se ven tu nombre, correo, rol
          {profile.habilidades?.length ? ", habilidades" : ""}
          {profile.cvURL ? " y el enlace a tu hoja de vida" : ""}.
        </p>
      </div>
    </IonContent>
  </IonModal>
);

export default ProfileQR;
