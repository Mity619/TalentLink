import {
  createContext,
  useState,
  useRef,
  type ReactNode,
} from "react";

import { useAuth } from "../Hooks/useAuth";

import {
  saveJob,
  removeSavedJob,
  getSavedJobsByUser,
  getLocalSavedJobIds,
  setLocalSavedJobIds,
} from "../Helpers/savedJobService";

interface SavedJobContextValue {
  savedJobIds: string[];
  loadingSavedJobs: boolean;
  savedJobsError: string;
  savedJobsReady: boolean;
  savingJobIds: string[];

  loadSavedJobs: () => Promise<void>;
  toggleSavedJob: (jobId: string) => Promise<boolean>;
  isSaved: (jobId: string) => boolean;
  isSaving: (jobId: string) => boolean;
}

export const SavedJobContext =
  createContext<SavedJobContextValue | null>(null);

interface SavedJobProviderProps {
  children: ReactNode;
}

export const SavedJobProvider = ({
  children,
}: SavedJobProviderProps) => {
  const { user, profile } = useAuth();

  const [savedJobIds, setSavedJobIds] =
    useState<string[]>([]);

  const [loadingSavedJobs, setLoadingSavedJobs] =
    useState(false);

  const [savedJobsError, setSavedJobsError] =
    useState("");

  const [savedJobsReady, setSavedJobsReady] =
    useState(false);

  const [savingJobIds, setSavingJobIds] =
    useState<string[]>([]);

  const savedIdsRef = useRef<Set<string>>(new Set());
  const pendingJobIds = useRef<Set<string>>(new Set());

  const loadingRef = useRef(false);
  const readyRef = useRef(false);

  const cacheQueue = useRef<Promise<void>>(
    Promise.resolve()
  );

  const canSave =
    profile?.activo === true &&
    profile.rol === "student";

  // Actualizar los favoritos en memoria.
  const updateSavedIds = (ids: string[]) => {
    const uniqueIds = [...new Set(ids)];

    savedIdsRef.current = new Set(uniqueIds);
    setSavedJobIds(uniqueIds);
  };

  // Guardar los identificadores en Preferences
  // respetando el orden de las escrituras.
  const persistLocalIds = (
    uid: string,
    ids: string[]
  ): Promise<void> => {
    const snapshot = [...ids];

    cacheQueue.current = cacheQueue.current
      .then(() => setLocalSavedJobIds(uid, snapshot))
      .catch((error) => {
        console.warn(
          "No se pudieron almacenar los favoritos localmente:",
          error
        );
      });

    return cacheQueue.current;
  };

  // Recuperar y sincronizar los favoritos.
  const loadSavedJobs = async (): Promise<void> => {
    if (!user || !canSave) {
      return;
    }

    if (
      loadingRef.current ||
      pendingJobIds.current.size > 0
    ) {
      return;
    }

    loadingRef.current = true;
    readyRef.current = false;

    setSavedJobsReady(false);
    setLoadingSavedJobs(true);
    setSavedJobsError("");

    try {
      // Recuperar primero los favoritos locales.
      try {
        const localIds =
          await getLocalSavedJobIds(user.uid);

        updateSavedIds(localIds);
      } catch (error) {
        console.warn(
          "No se pudieron recuperar los favoritos locales:",
          error
        );
      }

      // Firestore es la fuente principal.
      const remoteSavedJobs =
        await getSavedJobsByUser(user.uid);

      const remoteIds = remoteSavedJobs.map(
        (savedJob) => savedJob.jobId
      );

      updateSavedIds(remoteIds);

      await persistLocalIds(user.uid, remoteIds);

      readyRef.current = true;
      setSavedJobsReady(true);
    } catch (error) {
      console.error(
        "Error al sincronizar favoritos:",
        error
      );

      setSavedJobsError(
        "No se pudieron sincronizar las vacantes guardadas."
      );
    } finally {
      loadingRef.current = false;
      setLoadingSavedJobs(false);
    }
  };

  // Comprobar si una vacante está guardada.
  const isSaved = (jobId: string): boolean => {
    return savedIdsRef.current.has(jobId);
  };

  // Comprobar si una operación está en curso.
  const isSaving = (jobId: string): boolean => {
    return savingJobIds.includes(jobId);
  };

  // Guardar o quitar una vacante.
  const toggleSavedJob = async (
    jobId: string
  ): Promise<boolean> => {
    if (!user || !canSave) {
      throw new Error(
        "No tienes permisos para guardar vacantes."
      );
    }

    if (loadingRef.current || !readyRef.current) {
      throw new Error(
        "Primero debes sincronizar tus vacantes guardadas."
      );
    }

    if (pendingJobIds.current.has(jobId)) {
      throw new Error(
        "Ya hay una operación en proceso para esta vacante."
      );
    }

    pendingJobIds.current.add(jobId);

    setSavingJobIds((current) => [
      ...current,
      jobId,
    ]);

    const shouldSave = !isSaved(jobId);

    try {
      // Confirmar primero la operación en Firestore.
      if (shouldSave) {
        await saveJob(user.uid, jobId);
      } else {
        await removeSavedJob(user.uid, jobId);
      }

      // Actualizar el estado local.
      const updatedIds = new Set(savedIdsRef.current);

      if (shouldSave) {
        updatedIds.add(jobId);
      } else {
        updatedIds.delete(jobId);
      }

      const nextIds = [...updatedIds];

      updateSavedIds(nextIds);

      // Actualizar Preferences sin confundir un
      // error local con un fallo de Firestore.
      await persistLocalIds(user.uid, nextIds);

      return shouldSave;
    } finally {
      pendingJobIds.current.delete(jobId);

      setSavingJobIds((current) =>
        current.filter((id) => id !== jobId)
      );
    }
  };

  return (
    <SavedJobContext.Provider
      value={{
        savedJobIds,
        loadingSavedJobs,
        savedJobsError,
        savedJobsReady,
        savingJobIds,
        loadSavedJobs,
        toggleSavedJob,
        isSaved,
        isSaving,
      }}
    >
      {children}
    </SavedJobContext.Provider>
  );
};
