import { useEffect, useState, type FormEvent } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { Preferences } from "@capacitor/preferences";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../../Hooks/useAuth";
import styles from "./Login.module.scss";

const REMEMBER_KEY = "tl_remember_email";

const Login = () => {
  const { login, user, authMessage } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Preferences.get({ key: REMEMBER_KEY }).then(({ value }) => {
      if (value) {
        setEmail(value);
        setRemember(true);
      }
    });
  }, []);

  useEffect(() => {
    if (user) history.replace("/app/index");
  }, [user, history]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      if (remember) await Preferences.set({ key: REMEMBER_KEY, value: email.trim() });
      else await Preferences.remove({ key: REMEMBER_KEY });
    } catch {
      setError("Credenciales inválidas o cuenta bloqueada.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>TalentLink</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className={styles.wrapper}>
          <h2>Iniciar sesión</h2>
          <IonNote>Conecta talento con oportunidades.</IonNote>

          {(error || authMessage) && (
            <IonText color="danger">
              <p>{error || authMessage}</p>
            </IonText>
          )}

          <form onSubmit={onSubmit}>
            <IonItem>
              <IonLabel position="stacked">Correo</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value ?? "")}
                required
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value ?? "")}
                required
              />
            </IonItem>
            <IonItem lines="none">
              <IonLabel>Recordar correo</IonLabel>
              <IonToggle
                checked={remember}
                onIonChange={(e) => setRemember(Boolean(e.detail.checked))}
              />
            </IonItem>

            <IonButton expand="block" type="submit" disabled={busy}>
              {busy ? <IonSpinner name="dots" /> : "Entrar"}
            </IonButton>
          </form>

          <p className={styles.link}>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;