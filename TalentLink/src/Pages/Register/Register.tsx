import { useState, type FormEvent } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
  IonSpinner
} from "@ionic/react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../../Hooks/useAuth";
import { validateRegister, type RegisterInput } from "../../Helpers/validators";
import styles from "./Register.module.scss";

const Register = () => {
  const { register } = useAuth();
  const history = useHistory();
  const [form, setForm] = useState<RegisterInput>({
    nombre: "",
    email: "",
    password: "",
    confirm: "",
    rol: "student",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [firebaseError, setFirebaseError] = useState("");
  const [busy, setBusy] = useState(false);

  const setField =
    (key: keyof RegisterInput) =>
    (value: string) =>
      setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFirebaseError("");
    const errs = validateRegister(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      await register(form);
      history.replace("/app/index");
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setFirebaseError("Ese correo ya está registrado.");
      } else {
        setFirebaseError("No se pudo crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setBusy(false);
    }
  };

// En Register.tsx, cambia el return por este:
  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#fcf9f2' }}>
      <div className={styles.header}>
        <div className={styles.topLogo}>
          <div className={styles.logoCircle}>T</div>
          <h2>TalentLink</h2>
        </div>
        <h1>Crea tu cuenta</h1>
        <p>Empieza a conectar talento y oportunidades</p>
      </div>

      <div className={styles.formCard} style={{ marginTop: '-30px' }}>
        {firebaseError && (
          <IonText color="danger"><p>{firebaseError}</p></IonText>
        )}

        <form onSubmit={onSubmit}>
          <label className={styles.label}>Nombre completo</label>
          <IonInput className="custom-input" value={form.nombre} onIonInput={(e) => setField("nombre")(e.detail.value ?? "")} />
          {errors.nombre && <IonText color="danger"><p>{errors.nombre}</p></IonText>}

          <label className={styles.label}>Correo</label>
          <IonInput className="custom-input" type="email" value={form.email} onIonInput={(e) => setField("email")(e.detail.value ?? "")} />
          {errors.email && <IonText color="danger"><p>{errors.email}</p></IonText>}

          <label className={styles.label}>Contraseña</label>
          <IonInput className="custom-input" type="password" value={form.password} onIonInput={(e) => setField("password")(e.detail.value ?? "")} />
          {errors.password && <IonText color="danger"><p>{errors.password}</p></IonText>}

          <label className={styles.label}>Confirmar contraseña</label>
          <IonInput className="custom-input" type="password" value={form.confirm} onIonInput={(e) => setField("confirm")(e.detail.value ?? "")} />
          {errors.confirm && <IonText color="danger"><p>{errors.confirm}</p></IonText>}

          <label className={styles.label}>Soy</label>
          <div className="custom-input" style={{ padding: '8px 16px', marginBottom: '24px' }}>
            <IonSelect 
              value={form.rol} 
              interface="popover"
              onIonChange={(e) => setForm((f) => ({ ...f, rol: e.detail.value as "student" | "recruiter" }))}
            >
              <IonSelectOption value="student">Estudiante / Egresado</IonSelectOption>
              <IonSelectOption value="recruiter">Reclutador</IonSelectOption>
            </IonSelect>
          </div>

          <IonButton expand="block" type="submit" disabled={busy} className={styles.submitBtn}>
            {busy ? <IonSpinner name="dots" /> : "Registrarme"}
          </IonButton>
        </form>

        <p className={styles.link}>
          ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
        </p>
      </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;