import { IonContent, IonPage, IonButton, IonIcon } from "@ionic/react";
import { briefcaseOutline, documentTextOutline, chatbubbleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import styles from "./Welcome.module.scss";

const Welcome = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent fullscreen className={`teal-gradient-bg ${styles.welcomeContent}`}>
        <div className={styles.topLogo}>
          <div className={styles.logoCircle}>T</div>
          <h2>TalentLink</h2>
        </div>

        <div className={styles.heroText}>
          <h1>Del aula a tu primer empleo.</h1>
          <p>Muestra tu talento, encuentra vacantes cerca de ti y habla directo con quien contrata.</p>
        </div>

        <div className={styles.features}>
          <div className={styles.featureItem}>
            <IonIcon icon={briefcaseOutline} />
            <span>Vacantes con distancia en km</span>
          </div>
          <div className={styles.featureItem}>
            <IonIcon icon={documentTextOutline} />
            <span>Tu hoja de vida en PDF</span>
          </div>
          <div className={styles.featureItem}>
            <IonIcon icon={chatbubbleOutline} />
            <span>Chat en tiempo real</span>
          </div>
        </div>

        <div className={styles.actions}>
          <IonButton expand="block" color="secondary" className={styles.btnPrimary} onClick={() => history.push("/register")}>
            Crear cuenta
          </IonButton>
          <IonButton expand="block" fill="outline" className={styles.btnSecondary} onClick={() => history.push("/login")}>
            Ya tengo cuenta
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Welcome;