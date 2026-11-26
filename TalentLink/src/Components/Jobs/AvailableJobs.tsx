import {
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonSelect,
  IonSelectOption,
  useIonViewWillEnter,
} from "@ionic/react";

import {
  briefcaseOutline,
  locationOutline,
  refreshOutline,
} from "ionicons/icons";

import { useJobs } from "../../Hooks/useJobs";
import {
  JOB_AREAS,
  modalidadLabel,
  type Modalidad,
} from "../../Helpers/jobs";

import styles from "../../Pages/Jobs/Jobs.module.scss";

const AvailableJobs = () => {
  const {
  availableJobs,
  filters,
  loadingAvailable,
  availableError,
  hasMore,
  restoreJobFilters,
  loadAvailableJobs,
  loadMoreJobs,
} = useJobs();
useIonViewWillEnter(() => {
  void restoreJobFilters();
});

  return (
    <>
      <div className={styles.heading}>
        <h2>Ofertas laborales</h2>
        <p>Encuentra tu próxima oportunidad laboral.</p>
      </div>

        <div className={styles.filters}>
        <h3>Filtrar vacantes</h3>

        <div className={styles.filterFields}>
            <IonSelect
            label="Área profesional"
            labelPlacement="stacked"
            interface="popover"
            className="custom-input"
            value={filters.area ?? ""}
            disabled={loadingAvailable}
            onIonChange={(e) =>
                void loadAvailableJobs({
                ...filters,
                area: e.detail.value || undefined,
                })
            }
            >
            <IonSelectOption value="">
                Todas las áreas
            </IonSelectOption>

            {JOB_AREAS.map((area) => (
                <IonSelectOption key={area} value={area}>
                {area}
                </IonSelectOption>
            ))}
            </IonSelect>

            <IonSelect
            label="Modalidad"
            labelPlacement="stacked"
            interface="popover"
            className="custom-input"
            value={filters.modalidad ?? ""}
            disabled={loadingAvailable}
            onIonChange={(e) =>
                void loadAvailableJobs({
                ...filters,
                modalidad: (e.detail.value || undefined) as
                    Modalidad | undefined,
                })
            }
            >
            <IonSelectOption value="">
                Todas las modalidades
            </IonSelectOption>

            {Object.entries(modalidadLabel).map(([value, label]) => (
                <IonSelectOption key={value} value={value}>
                {label}
                </IonSelectOption>
            ))}
            </IonSelect>
        </div>

        {(filters.area || filters.modalidad) && (
            <IonButton
            fill="clear"
            size="small"
            className={styles.clearFiltersBtn}
            disabled={loadingAvailable}
            onClick={() => void loadAvailableJobs({})}
            >
            Limpiar filtros
            </IonButton>
        )}
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

            <p>
            {filters.area || filters.modalidad
                ? "Prueba seleccionando otros filtros."
                : "Vuelve más tarde para consultar nuevas ofertas."}
            </p>
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
