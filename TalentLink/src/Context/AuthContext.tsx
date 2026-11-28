import { createContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
  type User,
  type UserCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { Preferences } from "@capacitor/preferences";
import { auth, db } from "../Helpers/firebase";
import type { RegisterInput, Rol } from "../Helpers/validators";

export interface UserProfile {
  nombre: string;
  email: string;
  rol: Rol;
  fotoURL: string;
  habilidades: string[];
  cvURL: string;
  activo: boolean;
  creadoEn?: Timestamp;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authMessage: string;
  register: (data: RegisterInput) => Promise<User>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "tl_session";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
  const registeringRef = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        await Preferences.remove({ key: SESSION_KEY });
        return;
      }

      const snap = await getDoc(doc(db, "users", fbUser.uid));

      if (!snap.exists()) {
        if (registeringRef.current) {
          setUser(fbUser);
          setLoading(false);
          return;
        }
        setAuthMessage("Tu cuenta fue eliminada. Contacta al administrador.");
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const data = snap.data() as UserProfile;

      if (data.activo === false) {
        setAuthMessage("Tu cuenta está bloqueada. Contacta al administrador.");
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setAuthMessage("");
      setProfile(data);
      setUser(fbUser);
      setLoading(false);
      await Preferences.set({
        key: SESSION_KEY,
        value: JSON.stringify({ uid: fbUser.uid, email: fbUser.email, rol: data.rol }),
      });
    });

    return () => unsub();
  }, []);

  const register = async (data: RegisterInput): Promise<User> => {
    registeringRef.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateAuthProfile(cred.user, { displayName: data.nombre });
      const newProfile = {
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        fotoURL: "",
        habilidades: [] as string[],
        cvURL: "",
        activo: true,
      };
      await setDoc(doc(db, "users", cred.user.uid), {
        ...newProfile,
        creadoEn: serverTimestamp(),
      });
      setProfile(newProfile);
      return cred.user;
    } finally {
      registeringRef.current = false;
    }
  };

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const refreshProfile = async (): Promise<void> => {
    if (!auth.currentUser) return;
    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (snap.exists()) setProfile(snap.data() as UserProfile);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, authMessage, register, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};