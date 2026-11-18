import { useEffect, useState, type FormEvent } from "react";
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../Helpers/firebase";
import { useAuth } from "../../Hooks/useAuth";
import { parseSkills, roleLabel, validateProfile } from "../../Helpers/validators";
import styles from "./Profile.module.scss";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [nombre, setNombre] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [errors, setErrors] = useState<{ nombre?: string; habilidades?: string }>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || "");
      setHabilidades((profile.habilidades || []).join(", "));
    }
  }, [profile]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMsg("");
    const errs = validateProfile({ nombre, habilidades });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        nombre: nombre.trim(),
        habilidades: parseSkills(habilidades),
      });
      await refreshProfile();
      setMsg("Perfil actualizado.");
    } catch {
      setMsg("No se pudo actualizar el perfil.");
    } finally {
      setBusy(false);
    }
  };

  const onPickPhoto = async () => {
    if (!user) return;
    setMsg("");
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });

      if (!photo.webPath) throw new Error("Sin webPath");

      setUploading(true);
      const blob = await (await fetch(photo.webPath)).blob();
      const storageRef = ref(storage, `profiles/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob, { contentType: blob.type || "image/jpeg" });
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", user.uid), { fotoURL: url });
      await refreshProfile();
      setMsg("Foto actualizada.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message !== "User cancelled photos app") {
        setMsg("No se pudo subir la foto. Revisa permisos de cámara.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Mi perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className={styles.header}>
          <IonAvatar className={styles.avatar}>
            <img
              src={profile?.fotoURL || "https://ionicframework.com/docs/img/demos/avatar.svg"}
              alt="avatar"
            />
          </IonAvatar>
          <IonButton size="small" onClick={onPickPhoto} disabled={uploading}>
            {uploading ? <IonSpinner name="dots" /> : "Cambiar foto"}
          </IonButton>
          <IonText color="medium">
            <p>{profile ? roleLabel[profile.rol] : "Usuario"}</p>
          </IonText>
        </div>

        {msg && (
          <IonText color={msg.startsWith("No se pudo") ? "danger" : "success"}>
            <p>{msg}</p>
          </IonText>
        )}

        <form onSubmit={onSave}>
          <IonItem>
            <IonLabel position="stacked">Nombre</IonLabel>
            <IonInput value={nombre} onIonInput={(e) => setNombre(e.detail.value ?? "")} />
          </IonItem>
          {errors.nombre && <IonText color="danger"><p>{errors.nombre}</p></IonText>}

          <IonItem>
            <IonLabel position="stacked">Correo (no editable)</IonLabel>
            <IonInput value={profile?.email || ""} readonly />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Habilidades (separadas por coma)</IonLabel>
            <IonInput
              value={habilidades}
              placeholder="React, Firebase, SQL"
              onIonInput={(e) => setHabilidades(e.detail.value ?? "")}
            />
          </IonItem>
          {errors.habilidades && <IonText color="danger"><p>{errors.habilidades}</p></IonText>}

          <IonButton expand="block" type="submit" disabled={busy} className="ion-margin-top">
            Guardar cambios
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Profile;