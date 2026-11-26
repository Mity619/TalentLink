import { useState, type FormEvent } from "react";
import {
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonIcon,
} from "@ionic/react";

import { locateOutline } from "ionicons/icons";
import { useLocation } from "../../Hooks/useLocation";

import {
  modalidadLabel,
  type JobInput,
  type Modalidad,
} from "../../Helpers/jobs";

import {
  validateJob,
  type FieldErrors,
} from "../../Helpers/validators";

import styles from "./JobForm.module.scss";

interface JobFormProps {
  initialData?: JobInput;
  onSubmit: (data: JobInput) => Promise<void>;
  onCancel: () => void;
}

const emptyJob: JobInput = {
  titulo: "",
  descripcion: "",
  empresa: "",
  area: "",
  modalidad: "presencial",
  ciudad: "",
  lat: null,
  lng: null,
};

const JobForm = ({
  initialData,
  onSubmit,
  onCancel,
}: JobFormProps) => {
  const [form, setForm] = useState<JobInput>(
    initialData ?? emptyJob
  );

  const [errors, setErrors] = useState<FieldErrors<JobInput>>({});
  const [firebaseError, setFirebaseError] = useState("");
  const [busy, setBusy] = useState(false);

  const [manualLocation, setManualLocation] = useState(false);

  const {
    getLocation,
    loading: locating,
    error: locationError,
  } = useLocation();

  const hasLocation =
    form.lat !== null &&
    form.lng !== null &&
    Number.isFinite(form.lat) &&
    Number.isFinite(form.lng);


  const setField = <K extends keyof JobInput>(
    key: K,
    value: JobInput[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

    const handleGetLocation = async () => {
    const coordinates = await getLocation();

    if (!coordinates) return;

    setForm((current) => ({
        ...current,
        lat: coordinates.lat,
        lng: coordinates.lng,
    }));

    setErrors((current) => ({
        ...current,
        lat: undefined,
        lng: undefined,
    }));

    setManualLocation(false);
    };

    const handleClearLocation = () => {
    setForm((current) => ({
        ...current,
        lat: null,
        lng: null,
    }));

    setErrors((current) => ({
        ...current,
        lat: undefined,
        lng: undefined,
    }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (busy || locating) return;

    setFirebaseError("");

    const errs = validateJob(form);
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setBusy(true);

    try {
      await onSubmit(form);
    } catch {
      setFirebaseError(
        "No se pudo guardar la vacante. Intenta de nuevo."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
    >
      <h2>
        {initialData ? "Editar vacante" : "Publicar vacante"}
      </h2>

      {firebaseError && (
        <IonText color="danger">
          <p>{firebaseError}</p>
        </IonText>
      )}

      <IonInput
        label="Título de la vacante"
        labelPlacement="stacked"
        className="custom-input"
        placeholder="Ej. Desarrollador junior"
        value={form.titulo}
        disabled={busy}
        onIonInput={(e) =>
          setField("titulo", e.detail.value ?? "")
        }
      />
      {errors.titulo && (
        <IonText color="danger">
          <p>{errors.titulo}</p>
        </IonText>
      )}

      <IonInput
        label="Empresa"
        labelPlacement="stacked"
        className="custom-input"
        placeholder="Nombre de la empresa"
        value={form.empresa}
        disabled={busy}
        onIonInput={(e) =>
          setField("empresa", e.detail.value ?? "")
        }
      />
      {errors.empresa && (
        <IonText color="danger">
          <p>{errors.empresa}</p>
        </IonText>
      )}

      <IonTextarea
        label="Descripción"
        labelPlacement="stacked"
        className="custom-input"
        placeholder="Describe la oferta laboral"
        value={form.descripcion}
        rows={4}
        disabled={busy}
        onIonInput={(e) =>
          setField("descripcion", e.detail.value ?? "")
        }
      />
      {errors.descripcion && (
        <IonText color="danger">
          <p>{errors.descripcion}</p>
        </IonText>
      )}

      <IonInput
        label="Área profesional"
        labelPlacement="stacked"
        className="custom-input"
        placeholder="Ej. Tecnología"
        value={form.area}
        disabled={busy}
        onIonInput={(e) =>
          setField("area", e.detail.value ?? "")
        }
      />
      {errors.area && (
        <IonText color="danger">
          <p>{errors.area}</p>
        </IonText>
      )}

      <IonSelect
        label="Modalidad"
        labelPlacement="stacked"
        className="custom-input"
        interface="popover"
        value={form.modalidad}
        disabled={busy}
        onIonChange={(e) =>
          setField("modalidad", e.detail.value as Modalidad)
        }
      >
        {Object.entries(modalidadLabel).map(([value, label]) => (
          <IonSelectOption key={value} value={value}>
            {label}
          </IonSelectOption>
        ))}
      </IonSelect>
      {errors.modalidad && (
        <IonText color="danger">
          <p>{errors.modalidad}</p>
        </IonText>
      )}

      <IonInput
        label="Ciudad"
        labelPlacement="stacked"
        className="custom-input"
        placeholder="Ej. Cali"
        value={form.ciudad}
        disabled={busy}
        onIonInput={(e) =>
          setField("ciudad", e.detail.value ?? "")
        }
      />
      {errors.ciudad && (
        <IonText color="danger">
          <p>{errors.ciudad}</p>
        </IonText>
      )}

      <div className={styles.coordinates}> 
        <div className={styles.locationSection}>
        <h3>
            Ubicación del trabajo
            {form.modalidad === "remoto" && " (opcional)"}
        </h3>

        <p className={styles.locationHelp}>
            Registra el lugar donde se realizará el trabajo.
            Usa tu ubicación actual únicamente si te encuentras allí.
        </p>

        <IonButton
            expand="block"
            fill="outline"
            type="button"
            className={styles.locationBtn}
            disabled={busy || locating}
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

        {hasLocation && (
            <div className={styles.locationStatus}>
            <strong>Ubicación registrada</strong>

            <span>
                {form.lat?.toFixed(5)}, {form.lng?.toFixed(5)}
            </span>

            <IonButton
                fill="clear"
                size="small"
                type="button"
                disabled={busy || locating}
                onClick={handleClearLocation}
            >
                Quitar ubicación
            </IonButton>
            </div>
        )}

        <IonButton
            expand="block"
            fill="clear"
            type="button"
            className={styles.manualBtn}
            disabled={busy || locating}
            onClick={() => setManualLocation(!manualLocation)}
        >
            {manualLocation
            ? "Ocultar coordenadas"
            : "Ingresar coordenadas manualmente"}
        </IonButton>

        {manualLocation && (
            <div className={styles.coordinates}>
            <div>
                <IonInput
                label="Latitud"
                labelPlacement="stacked"
                className="custom-input"
                type="number"
                step="any"
                placeholder="3.4516"
                value={form.lat ?? ""}
                disabled={busy || locating}
                onIonInput={(e) =>
                    setField(
                    "lat",
                    e.detail.value?.trim()
                        ? Number(e.detail.value)
                        : null
                    )
                }
                />
            </div>

            <div>
                <IonInput
                label="Longitud"
                labelPlacement="stacked"
                className="custom-input"
                type="number"
                step="any"
                placeholder="-76.5320"
                value={form.lng ?? ""}
                disabled={busy || locating}
                onIonInput={(e) =>
                    setField(
                    "lng",
                    e.detail.value?.trim()
                        ? Number(e.detail.value)
                        : null
                    )
                }
                />
            </div>
            </div>
        )}

        {(errors.lat || errors.lng) && (
            <IonText color="danger">
            <p>{errors.lat || errors.lng}</p>
            </IonText>
        )}
        </div>
      </div>

      <IonButton
        expand="block"
        type="submit"
        disabled={busy || locating}
        className={styles.submitBtn}
      >
        {busy ? (
          <IonSpinner name="dots" />
        ) : initialData ? (
          "Guardar cambios"
        ) : (
          "Publicar vacante"
        )}
      </IonButton>

      <IonButton
        expand="block"
        fill="clear"
        type="button"
        disabled={busy || locating}
        className={styles.cancelBtn}
        onClick={onCancel}
      >
        Cancelar
      </IonButton>
    </form>
  );
};

export default JobForm;
