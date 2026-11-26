import { useState, useEffect } from "react";
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

import { getAllActiveJobs } from "../../Helpers/jobService";
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
  type Job,
} from "../../Helpers/jobs";

import styles from "../../Pages/Jobs/Jobs.module.scss";

const DISTANCE_OPTIONS = [5, 10, 25, 50, 100];
const NEARBY_PAGE_SIZE = 10;

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
  clearError: clearLocationError,
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

// Estados del filtro de cercanía.
const [maxDistance, setMaxDistance] =
  useState<number | null>(null);

const [nearbyCandidates, setNearbyCandidates] =
  useState<Job[]>([]);

const [loadingNearby, setLoadingNearby] =
  useState(false);

const [nearbyError, setNearbyError] =
  useState("");

const [nearbyVisibleCount, setNearbyVisibleCount] =
  useState(NEARBY_PAGE_SIZE);

const [nearbyRefresh, setNearbyRefresh] =
  useState(0);

const [loadedNearbyKey, setLoadedNearbyKey] =
  useState<string | null>(null);

const isNearbyMode =
  studentLocation !== null && maxDistance !== null;

const nearbyQueryKey = JSON.stringify([
  filters.area ?? "",
  filters.modalidad ?? "",
]);

const isLoadingJobs =
  loadingAvailable ||
  (isNearbyMode &&
    (loadingNearby ||
      loadedNearbyKey !== nearbyQueryKey));

const jobsError = isNearbyMode
  ? nearbyError
  : availableError;

useIonViewWillEnter(() => {
  void restoreJobFilters();
});

useEffect(() => {
  if (!isNearbyMode) {
    setNearbyCandidates([]);
    setNearbyError("");
    setLoadingNearby(false);
    setLoadedNearbyKey(null);
    return;
  }

  let cancelled = false;

  const loadNearbyCandidates = async () => {
    setLoadingNearby(true);
    setNearbyError("");
    setNearbyCandidates([]);
    setLoadedNearbyKey(null);

    try {
      const jobs = await getAllActiveJobs({
        area: filters.area,
        modalidad: filters.modalidad,
      });

      if (cancelled) return;

      setNearbyCandidates(jobs);
    } catch (error) {
      if (cancelled) return;

      console.error(
        "Error al consultar vacantes cercanas:",
        error
      );

      setNearbyError(
        "No se pudieron consultar las vacantes cercanas."
      );
    } finally {
      if (!cancelled) {
        setLoadedNearbyKey(nearbyQueryKey);
        setLoadingNearby(false);
      }
    }
  };

  void loadNearbyCandidates();

  return () => {
    cancelled = true;
  };
}, [
  isNearbyMode,
  filters.area,
  filters.modalidad,
  nearbyQueryKey,
  nearbyRefresh,
]);

useEffect(() => {
  setNearbyVisibleCount(NEARBY_PAGE_SIZE);
}, [
  maxDistance,
  studentLocation,
  filters.area,
  filters.modalidad,
  nearbyRefresh,
]);

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

  clearLocationError();
  setManualLocation(false);
};

// Eliminar la ubicación registrada.
const handleClearLocation = () => {
  setStudentLocation(null);
  setManualLat(null);
  setManualLng(null);
  setManualError("");
  setManualLocation(false);
  setMaxDistance(null);

  clearLocationError();
};

const sourceJobs = isNearbyMode
  ? loadedNearbyKey === nearbyQueryKey
    ? nearbyCandidates
    : []
  : availableJobs;

const jobsWithDistance = sourceJobs.map((job) => ({
  ...job,
  distance: getDistanceOrNull(
    studentLocation?.lat ?? null,
    studentLocation?.lng ?? null,
    job.lat,
    job.lng
  ),
}));

const filteredJobs =
  isNearbyMode && maxDistance !== null
    ? jobsWithDistance.filter(
        (job) =>
          job.distance !== null &&
          job.distance <= maxDistance
      )
    : jobsWithDistance;

const visibleJobs = isNearbyMode
  ? filteredJobs.slice(0, nearbyVisibleCount)
  : filteredJobs;

const hasMoreVisible = isNearbyMode
  ? filteredJobs.length > nearbyVisibleCount
  : hasMore;

const handleRefreshJobs = () => {
  void loadAvailableJobs();

  if (isNearbyMode) {
    setNearbyRefresh((current) => current + 1);
  }
};

const handleLoadMore = () => {
  if (isNearbyMode) {
    setNearbyVisibleCount(
      (current) => current + NEARBY_PAGE_SIZE
    );
  } else {
    void loadMoreJobs();
  }
};

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

        <div className={styles.distanceFilter}>
          <IonSelect
            label="Distancia máxima"
            labelPlacement="stacked"
            interface="popover"
            className="custom-input"
            value={maxDistance ?? 0}
            disabled={!studentLocation || locating}
            onIonChange={(e) => {
              const value = Number(e.detail.value);

              setNearbyVisibleCount(NEARBY_PAGE_SIZE);
              setMaxDistance(value === 0 ? null : value);
            }}
          >
            <IonSelectOption value={0}>
              Cualquier distancia
            </IonSelectOption>

            {DISTANCE_OPTIONS.map((distance) => (
              <IonSelectOption key={distance} value={distance}>
                Hasta {distance} km
              </IonSelectOption>
            ))}
          </IonSelect>

          {!studentLocation && (
            <p className={styles.distanceHelp}>
              Registra tu ubicación para filtrar por cercanía.
            </p>
          )}

          {isNearbyMode && (
            <p className={styles.distanceHelp}>
              Se muestran ofertas con ubicación registrada
              dentro de la distancia seleccionada.
            </p>
          )}
        </div>

        {(filters.area ||
          filters.modalidad ||
          maxDistance !== null) && (
          <IonButton
            fill="clear"
            size="small"
            className={styles.clearFiltersBtn}
            disabled={isLoadingJobs}
            onClick={() => {
              setMaxDistance(null);
              void loadAvailableJobs({});
            }}
          >
            Limpiar filtros
          </IonButton>
        )}

        </div>

      <div className={styles.listToolbar}>
        <span>
          {visibleJobs.length} vacantes mostradas
        </span>

        <IonButton
          fill="clear"
          size="small"
          className={styles.refreshBtn}
          disabled={isLoadingJobs}
          onClick={handleRefreshJobs}
        >
          <IonIcon
            icon={refreshOutline}
            slot="start"
          />
          Actualizar
        </IonButton>
      </div>

      {jobsError && (
        <IonText color="danger">
          <p>{jobsError}</p>

          {visibleJobs.length === 0 && (
            <IonButton
              fill="clear"
              size="small"
              disabled={isLoadingJobs}
              onClick={handleRefreshJobs}
            >
              Reintentar
            </IonButton>
          )}
        </IonText>
      )}

      {!isLoadingJobs &&
        !jobsError &&
        visibleJobs.length === 0 && (
          <div className={styles.empty}>
            <IonIcon icon={briefcaseOutline} />

            <h3>
              {isNearbyMode
                ? "No hay vacantes cercanas"
                : "No hay vacantes disponibles"}
            </h3>

            <p>
              {isNearbyMode
                ? "Prueba aumentando la distancia máxima o cambiando los filtros."
                : filters.area || filters.modalidad
                  ? "Prueba seleccionando otros filtros."
                  : "Vuelve más tarde para consultar nuevas ofertas."}
            </p>
          </div>
        )}

      <div className={styles.jobsList}>
        {visibleJobs.map((job) => (
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

      {isLoadingJobs && (
        <div className={styles.loading}>
          <IonSpinner name="crescent" />
        </div>
      )}

      {hasMoreVisible && !isLoadingJobs && (
        <IonButton
          expand="block"
          fill="outline"
          className={styles.loadMoreBtn}
          onClick={handleLoadMore}
        >
          Cargar más
        </IonButton>
      )}

      {!hasMoreVisible &&
        !isLoadingJobs &&
        !jobsError &&
        visibleJobs.length > 0 && (
          <p className={styles.endMessage}>
            No hay más vacantes disponibles.
          </p>
        )}
    </>
  );
};

export default AvailableJobs;
