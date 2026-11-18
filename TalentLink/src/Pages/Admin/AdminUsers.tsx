import { useCallback, useEffect, useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../Helpers/firebase";
import { useAuth } from "../../Hooks/useAuth";
import { roleLabel, type Rol } from "../../Helpers/validators";
import type { UserProfile } from "../../Context/AuthContext";

interface AdminUser extends UserProfile {
  id: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) })));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActivo = async (u: AdminUser) => {
    await updateDoc(doc(db, "users", u.id), { activo: !u.activo });
    await load();
    setMsg(`Usuario ${u.nombre} ${u.activo ? "bloqueado" : "activado"}.`);
  };

  const changeRole = async (u: AdminUser, rol: Rol) => {
    if (u.id === user?.uid) {
      setMsg("No puedes cambiar tu propio rol.");
      return;
    }
    await updateDoc(doc(db, "users", u.id), { rol });
    await load();
    setMsg(`Rol de ${u.nombre} actualizado a ${roleLabel[rol]}.`);
  };

  const removeUser = async (u: AdminUser) => {
    if (u.id === user?.uid) {
      setMsg("No puedes eliminar tu propia cuenta.");
      return;
    }
    if (!window.confirm(`¿Eliminar el perfil de ${u.nombre}?`)) return;
    await deleteDoc(doc(db, "users", u.id));
    await load();
    setMsg(
      "Perfil eliminado. La cuenta de Auth requiere Cloud Function para borrarse por completo."
    );
  };

  const filtered = users.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Admin · Usuarios</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={query}
            onIonInput={(e) => setQuery(e.detail.value ?? "")}
            placeholder="Buscar por nombre o correo"
          />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {msg && (
          <IonText color="medium">
            <p className="ion-padding-horizontal">{msg}</p>
          </IonText>
        )}
        <IonList>
          {filtered.map((u) => (
            <IonItem key={u.id}>
              <IonLabel>
                <h2>{u.nombre}</h2>
                <p>{u.email}</p>
                <IonSelect
                  value={u.rol}
                  interface="popover"
                  onIonChange={(e) => changeRole(u, e.detail.value as Rol)}
                >
                  <IonSelectOption value="student">Estudiante</IonSelectOption>
                  <IonSelectOption value="recruiter">Reclutador</IonSelectOption>
                  <IonSelectOption value="admin">Administrador</IonSelectOption>
                </IonSelect>
              </IonLabel>
              <IonToggle
                slot="end"
                checked={u.activo !== false}
                onIonChange={() => toggleActivo(u)}
              />
              <IonButton slot="end" color="danger" fill="clear" onClick={() => removeUser(u)}>
                Eliminar
              </IonButton>
            </IonItem>
          ))}
          {!filtered.length && (
            <IonItem lines="none">
              <IonLabel>Sin resultados.</IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;