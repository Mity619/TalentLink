import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { cloudUploadOutline, documentTextOutline, openOutline, trashOutline } from "ionicons/icons";
import { useAuth } from "../../Hooks/useAuth";
import {
  deleteCvPdf,
  getCv,
  MAX_CV_SIZE_MB,
  saveCvForm,
  uploadCvPdf,
  validateCvForm,
  validateCvPdf,
  type Cv,
  type CvForm,
} from "../../Helpers/cvService";
import styles from "./CV.module.scss";

type Mode = "pdf" | "form";
type Msg = { text: string; ok: boolean } | null;

const CV = () => {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("pdf");
  const [cv, setCv] = useState<Cv | null>(null);
  const [form, setForm] = useState<CvForm>({ resumen: "", educacion: "", experiencia: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    if (!user) return;
    getCv(user.uid)
      .then((data) => {
        setCv(data);
        setForm({ resumen: data.resumen, educacion: data.educacion, experiencia: data.experiencia });
        if (!data.pdfURL && (data.resumen || data.educacion || data.experiencia)) setMode("form");
      })
      .catch((err) => {
        console.error("Error al cargar la hoja de vida:", err);
        setMsg({ text: "No se pudo cargar tu hoja de vida.", ok: false });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const run = async (action: () => Promise<void>, okText: string, errText: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await action();
      setMsg({ text: okText, ok: true });
    } catch (err) {
      console.error(errText, err);
      const known = err instanceof Error && err.message.startsWith("El ");
      setMsg({ text: known ? (err as Error).message : errText, ok: false });
    } finally {
      setBusy(false);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    const error = validateCvPdf(file);
    if (error) {
      setMsg({ text: error, ok: false });
      return;
    }

    void run(
      async () => {
        const url = await uploadCvPdf(user.uid, file);
        setCv((prev) => (prev ? { ...prev, pdfURL: url, pdfNombre: file.name } : prev));
        await refreshProfile();
      },
      "Hoja de vida subida.",
      "No se pudo subir el PDF."
    );
  };

  const onDeletePdf = () => {
    if (!user) return;
    void run(
      async () => {
        await deleteCvPdf(user.uid);
        setCv((prev) => (prev ? { ...prev, pdfURL: "", pdfNombre: "" } : prev));
        await refreshProfile();
      },
      "PDF eliminado.",
      "No se pudo eliminar el PDF."
    );
  };

  const onSaveForm = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const error = validateCvForm(form);
    if (error) {
      setMsg({ text: error, ok: false });
      return;
    }
    void run(() => saveCvForm(user.uid, form), "Hoja de vida guardada.", "No se pudo guardar la hoja de vida.");
  };

  const field = (key: keyof CvForm, label: string, placeholder: string) => (
    <>
      <label className={styles.label}>{label}</label>
      <IonTextarea
        className="custom-input"
        autoGrow
        rows={3}
        maxlength={1500}
        placeholder={placeholder}
        value={form[key]}
        disabled={busy}
        onIonInput={(e) => setForm((f) => ({ ...f, [key]: e.detail.value ?? "" }))}
      />
    </>
  );

  const msgEl = msg && (
    <IonText color={msg.ok ? "success" : "danger"}>
      <p className={styles.msg}>{msg.text}</p>
    </IonText>
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className={styles.toolbar}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profile" text="" />
          </IonButtons>
          <IonTitle className={styles.title}>Mi hoja de vida</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className={styles.content}>
        {profile && profile.rol !== "student" ? (
          <p className={styles.hint}>La hoja de vida solo está disponible para estudiantes.</p>
        ) : loading ? (
          <div className={styles.center}>
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <>
            <IonSegment
              className={styles.segment}
              value={mode}
              onIonChange={(e) => {
                setMode(e.detail.value as Mode);
                setMsg(null);
              }}
            >
              <IonSegmentButton value="pdf">
                <IonLabel>Subir PDF</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="form">
                <IonLabel>Llenar formulario</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            {mode === "pdf" ? (
              <div className={styles.card}>
                {cv?.pdfURL ? (
                  <div className={styles.pdfInfo}>
                    <IonIcon icon={documentTextOutline} />
                    <span>{cv.pdfNombre || "hoja-de-vida.pdf"}</span>
                  </div>
                ) : (
                  <p className={styles.hint}>Aún no has subido tu hoja de vida.</p>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={onFileChange}
                />

                <IonButton
                  expand="block"
                  className={styles.primaryBtn}
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {busy ? (
                    <IonSpinner name="dots" />
                  ) : (
                    <>
                      <IonIcon icon={cloudUploadOutline} slot="start" />
                      {cv?.pdfURL ? "Reemplazar PDF" : "Subir PDF"}
                    </>
                  )}
                </IonButton>
                <p className={styles.small}>Solo archivos PDF de hasta {MAX_CV_SIZE_MB} MB.</p>
                {msgEl}

                {cv?.pdfURL && (
                  <div className={styles.pdfActions}>
                    <IonButton fill="outline" className={styles.outlineBtn} href={cv.pdfURL} target="_blank">
                      <IonIcon icon={openOutline} slot="start" />
                      Ver PDF
                    </IonButton>
                    <IonButton fill="clear" color="danger" disabled={busy} onClick={onDeletePdf}>
                      <IonIcon icon={trashOutline} slot="start" />
                      Eliminar
                    </IonButton>
                  </div>
                )}
              </div>
            ) : (
              <form className={styles.card} onSubmit={onSaveForm}>
                {field("resumen", "Perfil profesional", "Cuéntale a los reclutadores quién eres y qué buscas.")}
                {field("educacion", "Educación", "Ej. Ingeniería Informática, UAO (2022 - actual)")}
                {field("experiencia", "Experiencia", "Prácticas, proyectos o trabajos anteriores.")}
                <IonButton expand="block" type="submit" className={styles.primaryBtn} disabled={busy}>
                  {busy ? <IonSpinner name="dots" /> : "Guardar"}
                </IonButton>
                {msgEl}
              </form>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CV;
