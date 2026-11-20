import { useEffect, useState, type FormEvent } from "react";
import {
  IonAvatar, IonButton, IonContent, IonHeader, IonInput, IonPage, 
  IonSpinner, IonText, IonTitle, IonToolbar, IonIcon
} from "@ionic/react";
import { cameraOutline } from "ionicons/icons";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Capacitor } from "@capacitor/core"; // Para el fallback en web
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

  const uploadFile = async (fileOrBlob: Blob) => {
    if (!user) return;
    setUploading(true);
    setMsg("");
    try {
      const storageRef = ref(storage, `profiles/${user.uid}.jpg`);
      await uploadBytes(storageRef, fileOrBlob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", user.uid), { fotoURL: url });
      await refreshProfile();
      setMsg("Foto actualizada.");
    } catch (error) {
      console.error(error);
      setMsg("No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  };

  const onPickPhoto = async () => {
    if (!user) return;
    setMsg("");

    if (Capacitor.getPlatform() === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (file) await uploadFile(file);
      };
      input.click();
      return;
    }

    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
      });
      if (!photo.webPath) throw new Error("Sin webPath");
      const blob = await (await fetch(photo.webPath)).blob();
      await uploadFile(blob);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message !== "User cancelled photos app") {
        setMsg("No se pudo acceder a la cámara.");
      }
    }
  };

  return (
    <IonPage className={styles.profilePage}>
      <IonHeader className="ion-no-border">
        <IonToolbar className={styles.toolbar}>
          <IonTitle className={styles.title}>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className={styles.content}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {profile?.fotoURL ? (
              <img src={profile.fotoURL} alt="avatar" className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarPlaceholder}>{profile?.nombre?.charAt(0)}</div>
            )}
          </div>
          
          <div className={styles.badge}>
            {profile ? roleLabel[profile.rol] : "Usuario"}
          </div>

          <IonButton fill="outline" className={styles.photoBtn} onClick={onPickPhoto} disabled={uploading}>
            {uploading ? <IonSpinner name="dots" /> : <><IonIcon icon={cameraOutline} slot="start" /> Cambiar foto</>}
          </IonButton>
        </div>

        {msg && (
          <IonText color={msg.includes("No se pudo") ? "danger" : "success"}>
            <p style={{ textAlign: 'center' }}>{msg}</p>
          </IonText>
        )}

        <form onSubmit={onSave} className={styles.form}>
          <label className={styles.label}>Nombre</label>
          <IonInput className="custom-input" value={nombre} onIonInput={(e) => setNombre(e.detail.value ?? "")} />
          {errors.nombre && <IonText color="danger"><p>{errors.nombre}</p></IonText>}

          <label className={styles.label}>Correo</label>
          <IonInput className="custom-input" value={profile?.email || ""} readonly style={{ opacity: 0.7 }} />

          <label className={styles.label}>Habilidades (separadas por coma)</label>
          <IonInput className="custom-input" value={habilidades} placeholder="React, Excel, Inglés B2" onIonInput={(e) => setHabilidades(e.detail.value ?? "")} />
          {errors.habilidades && <IonText color="danger"><p>{errors.habilidades}</p></IonText>}

          <IonButton expand="block" type="submit" className={styles.saveBtn} disabled={busy}>
            {busy ? <IonSpinner name="dots" /> : "Guardar"}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default Profile;