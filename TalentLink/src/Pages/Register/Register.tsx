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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Crear cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className={styles.wrapper}>
          <IonNote>Estudiantes y reclutadores pueden registrarse.</IonNote>
          {firebaseError && (
            <IonText color="danger">
              <p>{firebaseError}</p>
            </IonText>
          )}

          <form onSubmit={onSubmit}>
            <IonItem>
              <IonLabel position="stacked">Nombre completo</IonLabel>
              <IonInput
                value={form.nombre}
                onIonInput={(e) => setField("nombre")(e.detail.value ?? "")}
              />
            </IonItem>
            {errors.nombre && <IonText color="danger"><p>{errors.nombre}</p></IonText>}

            <IonItem>
              <IonLabel position="stacked">Correo</IonLabel>
              <IonInput
                type="email"
                value={form.email}
                onIonInput={(e) => setField("email")(e.detail.value ?? "")}
              />
            </IonItem>
            {errors.email && <IonText color="danger"><p>{errors.email}</p></IonText>}

            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={form.password}
                onIonInput={(e) => setField("password")(e.detail.value ?? "")}
              />
            </IonItem>
            {errors.password && <IonText color="danger"><p>{errors.password}</p></IonText>}

            <IonItem>
              <IonLabel position="stacked">Confirmar contraseña</IonLabel>
              <IonInput
                type="password"
                value={form.confirm}
                onIonInput={(e) => setField("confirm")(e.detail.value ?? "")}
              />
            </IonItem>
            {errors.confirm && <IonText color="danger"><p>{errors.confirm}</p></IonText>}

            <IonItem>
              <IonLabel>Rol</IonLabel>
              <IonSelect
                value={form.rol}
                onIonChange={(e) =>
                  setForm((f) => ({ ...f, rol: e.detail.value as "student" | "recruiter" }))
                }
              >
                <IonSelectOption value="student">Estudiante</IonSelectOption>
                <IonSelectOption value="recruiter">Reclutador</IonSelectOption>
              </IonSelect>
            </IonItem>
            {errors.rol && <IonText color="danger"><p>{errors.rol}</p></IonText>}

            <IonButton expand="block" type="submit" disabled={busy} className="ion-margin-top">
              Registrarme
            </IonButton>
          </form>

          <p className={styles.link}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;