import { useState } from "react";
import {
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonSelect,
  IonSelectOption,
  IonInput,
  useIonViewWillEnter,
} from "@ionic/react";

import {
  briefcaseOutline,
  locationOutline,
  refreshOutline,
  locateOutline,
  navigateOutline,
} from "ionicons/icons";

import { useJobs } from "../../Hooks/useJobs";
import {
  useLocation,
  type Coordinates,
} from "../../Hooks/useLocation";

import {
  isValidLatitude,
  isValidLongitude,
  getDistanceOrNull,
  formatDistance,
} from "../../Helpers/distance";
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

const {
  getLocation,
  loading: locating,
  error: locationError,
} = useLocation();

const [studentLocation, setStudentLocation] =
  useState<Coordinates | null>(null);

const [manualLocation, setManualLocation] =
  useState(false);

const [manualLat, setManualLat] =
  useState<number | null>(null);

const [manualLng, setManualLng] =
  useState<number | null>(null);

const [manualError, setManualError] =
  useState("");

useIonViewWillEnter(() => {
  void restoreJobFilters();
});

// Obtener la ubicación actual del estudiante.
const handleGetLocation = async () => {
  setManualError("");

  const coordinates = await getLocation();

  if (!coordinates) return;

  setStudentLocation(coordinates);
  setManualLat(coordinates.lat);
  setManualLng(coordinates.lng);
  setManualLocation(false);
};

// Confirmar las coordenadas introducidas manualmente.
const handleManualLocation = () => {
  setManualError("");

  if (!isValidLatitude(manualLat)) {
    setManualError("Ingresa una latitud válida.");
    return;
  }

  if (!isValidLongitude(manualLng)) {
    setManualError("Ingresa una longitud válida.");
    return;
  }

  setStudentLocation({
    lat: manualLat,
    lng: manualLng,
  });

  setManualLocation(false);
};

// Eliminar la ubicación registrada.
const handleClearLocation = () => {
  setStudentLocation(null);
  setManualLat(null);
  setManualLng(null);
  setManualError("");
  setManualLocation(false);
};

const jobsWithDistance = availableJobs.map((job) => ({
  ...job,
  distance: getDistanceOrNull(
    studentLocation?.lat ?? null,
    studentLocation?.lng ?? null,
    job.lat,
    job.lng
  ),
}));

  return (
    <>
      <div className={styles.heading}>
        <h2>Ofertas laborales</h2>
        <p>Encuentra tu próxima oportunidad laboral.</p>
      </div>
      <div className={styles.studentLocation}>
        <h3>Tu ubicación</h3>

        <p className={styles.locationHelp}>
          Activa tu ubicación para conocer la cercanía
          de las ofertas laborales.
        </p>

        <IonButton
          expand="block"
          fill="outline"
          className={styles.locationBtn}
          disabled={locating}
          onClick={handleGetLocation}
        >
          {locating ? (
            <IonSpinner name="dots" />
          ) : (
            <>
              <IonIcon icon={locateOutline} slot="start" />
              Usar mi ubicación actual
            </>
          )}
        </IonButton>

        {locationError && (
          <IonText color="danger">
            <p>{locationError}</p>
          </IonText>
        )}

        {studentLocation && (
          <div className={styles.locationStatus}>
            <strong>Ubicación registrada</strong>

            <span>
              {studentLocation.lat.toFixed(5)},{" "}
              {studentLocation.lng.toFixed(5)}
            </span>

            <IonButton
              fill="clear"
              size="small"
              disabled={locating}
              onClick={handleClearLocation}
            >
              Quitar ubicación
            </IonButton>
          </div>
        )}

        <IonButton
          expand="block"
          fill="clear"
          className={styles.manualLocationBtn}
          disabled={locating}
          onClick={() => {
            setManualLocation(!manualLocation);
            setManualError("");
          }}
        >
          {manualLocation
            ? "Ocultar coordenadas"
            : "Ingresar coordenadas manualmente"}
        </IonButton>

        {manualLocation && (
          <>
            <div className={styles.locationCoordinates}>
              <IonInput
                label="Latitud"
                labelPlacement="stacked"
                className="custom-input"
                type="number"
                step="any"
                placeholder="3.4516"
                value={manualLat ?? ""}
                disabled={locating}
                onIonInput={(e) =>
                  setManualLat(
                    e.detail.value?.trim()
                      ? Number(e.detail.value)
                      : null
                  )
                }
              />

              <IonInput
                label="Longitud"
                labelPlacement="stacked"
                className="custom-input"
                type="number"
                step="any"
                placeholder="-76.5320"
                value={manualLng ?? ""}
                disabled={locating}
                onIonInput={(e) =>
                  setManualLng(
                    e.detail.value?.trim()
                      ? Number(e.detail.value)
                      : null
                  )
                }
              />
            </div>

            {manualError && (
              <IonText color="danger">
                <p>{manualError}</p>
              </IonText>
            )}

            <IonButton
              expand="block"
              className={styles.confirmLocationBtn}
              disabled={locating}
              onClick={handleManualLocation}
            >
              Confirmar ubicación
            </IonButton>
          </>
        )}
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
        {jobsWithDistance.map((job) => (  
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

            <div className={styles.jobLocation}>
              <p className={styles.city}>
                <IonIcon icon={locationOutline} />
                {job.ciudad}
              </p>

              {job.distance !== null && (
                <span className={styles.distance}>
                  <IonIcon icon={navigateOutline} />
                  A {formatDistance(job.distance)}
                </span>
              )}
            </div>

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
