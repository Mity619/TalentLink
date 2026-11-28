import { useCallback, useEffect, useState } from "react";
import { 
  IonSegment, IonSegmentButton, IonLabel, IonToolbar, IonHeader, 
  IonContent, IonPage, IonSearchbar, IonIcon, IonToggle, IonSelect, IonSelectOption
} from '@ionic/react';
import { arrowBackOutline, trashOutline, shieldCheckmarkOutline, briefcaseOutline, documentTextOutline } from 'ionicons/icons';
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { useHistory } from "react-router-dom"; // Para la flecha
import { db } from "../../Helpers/firebase";
import { useAuth } from "../../Hooks/useAuth";
import { roleLabel, type Rol } from "../../Helpers/validators";
import type { UserProfile } from "../../Context/AuthContext";
import styles from "./AdminUsers.module.scss";

interface AdminUser extends UserProfile {
  id: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [segment, setSegment] = useState<string>("users");

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
    setMsg("Perfil eliminado.");
  };

  const filtered = users.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <IonPage className={styles.adminPage}>
      <IonHeader className="ion-no-border">
        <IonToolbar className={styles.topToolbar}>
          <div className={styles.headerTitle} onClick={() => history.push('/app/index')}>
            <IonIcon icon={arrowBackOutline} className={styles.backIcon} />
            <h1>Administración</h1>
          </div>
        </IonToolbar>
        
        <IonToolbar className={styles.segmentToolbar}>
          <div className={styles.segmentContainer}>
            <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as string)} mode="ios" className={styles.customSegment}>
              <IonSegmentButton value="users">
                <IonLabel>Usuarios</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="jobs">
                <IonLabel>Vacantes</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="reports">
                <IonLabel>Reportes</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>
        </IonToolbar>
      
        <IonToolbar className={styles.searchToolbar}>
          <IonSearchbar 
            className={styles.customSearch}
            placeholder="Buscar por nombre o correo" 
            value={query} 
            onIonInput={(e) => setQuery(e.detail.value ?? "")} 
          />
        </IonToolbar>
      </IonHeader>
      
      <IonContent className={styles.content}>
        {msg && <p className={styles.msg}>{msg}</p>}

        {segment === "users" && (
          <div className={styles.list}>
            {filtered.map((u) => (
              <div key={u.id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{u.nombre.charAt(0)}</div>
                  <div>
                    <h3>{u.nombre} {u.id === user?.uid && <span className={styles.you}>(tú)</span>}</h3>
                    <p>{u.email}</p>
                  </div>
                </div>
                
                <div className={styles.userActions}>
                  <IonSelect 
                    value={u.rol} 
                    interface="popover" 
                    onIonChange={(e) => changeRole(u, e.detail.value as Rol)}
                    className={styles.roleSelect}
                  >
                    <IonSelectOption value="student">Estudiante</IonSelectOption>
                    <IonSelectOption value="recruiter">Reclutador</IonSelectOption>
                    <IonSelectOption value="admin">Administrador</IonSelectOption>
                  </IonSelect>

                  <div className={styles.toggleWrapper}>
                    <span>Activo</span>
                    <IonToggle 
                      checked={u.activo !== false} 
                      onIonChange={() => toggleActivo(u)}
                      mode="ios"
                      className={styles.customToggle}
                    />
                  </div>

                  <IonIcon 
                    icon={trashOutline} 
                    className={styles.trashIcon} 
                    onClick={() => removeUser(u)} 
                  />
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className={styles.emptyState}>
                <p>No hay usuarios con estos filtros</p>
              </div>
            )}
          </div>
        )}

        {segment === "jobs" && (
          <div className={styles.emptyState}>
            <IonIcon icon={briefcaseOutline} className={styles.emptyIcon} />
            <p>No hay vacantes registradas</p>
          </div>
        )}

        {segment === "reports" && (
          <div className={styles.emptyState}>
            <IonIcon icon={documentTextOutline} className={styles.emptyIcon} />
            <p>No hay reportes</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;