
import {
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  useIonViewWillEnter,
} from "@ionic/react";

import {
  briefcaseOutline,
  locationOutline,
  refreshOutline,
} from "ionicons/icons";

import { useJobs } from "../../Hooks/useJobs";
import { modalidadLabel } from "../../Helpers/jobs";

import styles from "../../Pages/Jobs/Jobs.module.scss";

const AvailableJobs = () => {
  const {
    availableJobs,
    loadingAvailable,
    availableError,
    hasMore,
    loadAvailableJobs,
    loadMoreJobs,
  } = useJobs();

  useIonViewWillEnter(() => {
    void loadAvailableJobs();
  });

  return (
    <>
      <div className={styles.heading}>
        <h2>Ofertas laborales</h2>
        <p>Encuentra tu próxima oportunidad laboral.</p>
      </div>

      <div className={styles.listToolbar}>
        <span>
          {availableJobs.length} vacantes mostradas
        </span>

        <IonButton
          fill="clear"
          size="small"
          className={styles.refreshBtn}
          disabled={loadingAvailable}
          onClick={() => void loadAvailableJobs()}
        >
          <IonIcon
            icon={refreshOutline}
            slot="start"
          />
          Actualizar
        </IonButton>
      </div>

      {availableError && (
        <IonText color="danger">
          <p>{availableError}</p>

          {availableJobs.length === 0 && (
            <IonButton
              fill="clear"
              size="small"
              disabled={loadingAvailable}
              onClick={() => void loadAvailableJobs()}
            >
              Reintentar
            </IonButton>
          )}
        </IonText>
      )}

      {!loadingAvailable &&
        !availableError &&
        availableJobs.length === 0 && (
          <div className={styles.empty}>
            <IonIcon icon={briefcaseOutline} />
            <h3>No hay vacantes disponibles</h3>
            <p>Vuelve más tarde para consultar nuevas ofertas.</p>
          </div>
        )}

      <div className={styles.jobsList}>
        {availableJobs.map((job) => (
          <div key={job.id} className={styles.jobCard}>
            <div className={styles.cardHeader}>
              <h3>{job.titulo}</h3>
            </div>

            <p className={styles.company}>
              {job.empresa}
            </p>

            <div className={styles.tags}>
              <span>{job.area}</span>
              <span>{modalidadLabel[job.modalidad]}</span>
            </div>

            <p className={styles.city}>
              <IonIcon icon={locationOutline} />
              {job.ciudad}
            </p>

            <p className={styles.description}>
              {job.descripcion}
            </p>
          </div>
        ))}
      </div>

      {loadingAvailable && (
        <div className={styles.loading}>
          <IonSpinner name="crescent" />
        </div>
      )}

      {hasMore && !loadingAvailable && (
        <IonButton
          expand="block"
          fill="outline"
          className={styles.loadMoreBtn}
          onClick={() => void loadMoreJobs()}
        >
          Cargar más
        </IonButton>
      )}

      {!hasMore &&
        !loadingAvailable &&
        !availableError &&
        availableJobs.length > 0 && (
          <p className={styles.endMessage}>
            No hay más vacantes disponibles.
          </p>
        )}
    </>
  );
};

export default AvailableJobs;
