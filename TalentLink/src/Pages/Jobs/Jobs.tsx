import { useState } from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonSpinner,
  IonAlert,
  IonText,
  useIonViewWillEnter,
} from "@ionic/react";

import {
  addOutline,
  createOutline,
  trashOutline,
  briefcaseOutline,
  locationOutline,
} from "ionicons/icons";

import { useAuth } from "../../Hooks/useAuth";
import { useJobs } from "../../Hooks/useJobs";

import {
  modalidadLabel,
  type Job,
  type JobInput,
} from "../../Helpers/jobs";

import JobForm from "../../Components/Jobs/JobForm";
import styles from "./Jobs.module.scss";

const Jobs = () => {
  const { profile } = useAuth();

  const {
    myJobs,
    loading,
    loadMyJobs,
    addJob,
    editJob,
    removeJob,
  } = useJobs();

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canManage =
    profile?.activo === true &&
    (profile.rol === "recruiter" || profile.rol === "admin");

  const refreshJobs = async () => {
    setError("");

    try {
      await loadMyJobs();
    } catch {
      setError("No se pudieron cargar las vacantes.");
    }
  };

  useIonViewWillEnter(() => {
    if (canManage) {
      void refreshJobs();
    }
  }, [canManage]);

  const handleCreate = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleSave = async (data: JobInput) => {
    if (!canManage) {
      throw new Error("No tienes permisos para gestionar vacantes.");
    }

    if (editingJob) {
      await editJob(editingJob.id, data);
    } else {
      await addJob(data);
    }

    handleCancel();
  };

  const handleDelete = async (jobId: string) => {
    if (!canManage || deleting) return;

    setDeleting(true);
    setError("");

    try {
      await removeJob(jobId);
    } catch {
      setError("No se pudo eliminar la vacante.");
    } finally {
      setDeleting(false);
      setJobToDelete(null);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ "--background": "#fcf9f2" }}>
          <IonTitle style={{ color: "#333", fontWeight: "bold" }}>
            Vacantes
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        style={{ "--background": "#fcf9f2" }}
        className="ion-padding"
      >
        <div className={styles.container}>
          {canManage ? (
            showForm ? (
              <JobForm
                key={editingJob?.id ?? "new"}
                initialData={editingJob ?? undefined}
                onSubmit={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <>
                <div className={styles.heading}>
                  <h2>Mis vacantes</h2>
                  <p>Gestiona tus ofertas laborales.</p>
                </div>

                <IonButton
                  expand="block"
                  className={styles.createBtn}
                  disabled={deleting}
                  onClick={handleCreate}
                >
                  <IonIcon icon={addOutline} slot="start" />
                  Publicar vacante
                </IonButton>

                {error && (
                  <IonText color="danger">
                    <p>{error}</p>
                    <IonButton
                      fill="clear"
                      size="small"
                      onClick={refreshJobs}
                    >
                      Actualizar listado
                    </IonButton>
                  </IonText>
                )}

                {loading ? (
                  <div className={styles.loading}>
                    <IonSpinner name="crescent" />
                  </div>
                ) : myJobs.length === 0 && !error ? (
                  <div className={styles.empty}>
                    <IonIcon icon={briefcaseOutline} />
                    <h3>Aún no tienes vacantes</h3>
                    <p>Publica tu primera oferta laboral.</p>
                  </div>
                ) : (
                  <div className={styles.jobsList}>
                    {myJobs.map((job) => (
                      <div key={job.id} className={styles.jobCard}>
                        <div className={styles.cardHeader}>
                          <h3>{job.titulo}</h3>

                          <span className={styles.status}>
                            {job.estado === "activa"
                              ? "Activa"
                              : "Cerrada"}
                          </span>
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

                        <div className={styles.actions}>
                          <IonButton
                            fill="outline"
                            size="small"
                            className={styles.editBtn}
                            disabled={deleting}
                            onClick={() => handleEdit(job)}
                          >
                            <IonIcon
                              icon={createOutline}
                              slot="start"
                            />
                            Editar
                          </IonButton>

                          <IonButton
                            fill="clear"
                            color="danger"
                            size="small"
                            disabled={deleting}
                            onClick={() => setJobToDelete(job)}
                          >
                            <IonIcon
                              icon={trashOutline}
                              slot="start"
                            />
                            Eliminar
                          </IonButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          ) : (
            <div className={styles.empty}>
              <IonIcon icon={briefcaseOutline} />
              <h3>Ofertas laborales</h3>
              <p>Próximamente podrás explorar las vacantes.</p>
            </div>
          )}
        </div>

        <IonAlert
          isOpen={jobToDelete !== null}
          header="Eliminar vacante"
          message="¿Estás seguro de eliminar esta vacante? Esta acción no se puede deshacer."
          onDidDismiss={() => setJobToDelete(null)}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
            },
            {
              text: "Eliminar",
              role: "destructive",
              handler: () => {
                if (jobToDelete) {
                  void handleDelete(jobToDelete.id);
                }
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Jobs;
