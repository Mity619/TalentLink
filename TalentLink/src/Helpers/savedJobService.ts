import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocsFromServer,
  query,
  where,
  getDocFromServer,
} from "firebase/firestore";

import { Preferences } from "@capacitor/preferences";

import { db } from "./firebase";

import {
  getSavedJobId,
  getSavedJobsStorageKey,
  type SavedJob,
} from "./savedJobs";
import type { Job } from "./jobs";

const savedJobsCollection = collection(db, "savedJobs");

// Guardar una vacante en Firestore.
export const saveJob = async (
  uid: string,
  jobId: string
): Promise<void> => {
  if (!uid || !jobId) {
    throw new Error(
      "No se pudo identificar al estudiante o la vacante."
    );
  }

  const savedJobRef = doc(
    savedJobsCollection,
    getSavedJobId(uid, jobId)
  );

  await setDoc(savedJobRef, {
    uid,
    jobId,
  });
};

// Quitar una vacante guardada de Firestore.
export const removeSavedJob = async (
  uid: string,
  jobId: string
): Promise<void> => {
  if (!uid || !jobId) {
    throw new Error(
      "No se pudo identificar al estudiante o la vacante."
    );
  }

  const savedJobRef = doc(
    savedJobsCollection,
    getSavedJobId(uid, jobId)
  );

  await deleteDoc(savedJobRef);
};

// Consultar las vacantes guardadas del estudiante.
export const getSavedJobsByUser = async (
  uid: string
): Promise<SavedJob[]> => {
  if (!uid) {
    throw new Error(
      "No se pudo identificar al estudiante."
    );
  }

  const savedJobsQuery = query(
    savedJobsCollection,
    where("uid", "==", uid)
  );

  const snapshot = await getDocsFromServer(savedJobsQuery);

  return snapshot.docs.map((savedJobDoc) => ({
    ...savedJobDoc.data(),
    id: savedJobDoc.id,
  } as SavedJob));
};

// Recuperar los identificadores guardados localmente.
export const getLocalSavedJobIds = async (
  uid: string
): Promise<string[]> => {
  if (!uid) {
    throw new Error(
      "No se pudo identificar al estudiante."
    );
  }

  const { value } = await Preferences.get({
    key: getSavedJobsStorageKey(uid),
  });

  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    const validIds = parsed.filter(
      (id): id is string =>
        typeof id === "string" &&
        id.trim().length > 0
    );

    return [...new Set(validIds)];
  } catch {
    return [];
  }
};

// Almacenar los identificadores localmente.
export const setLocalSavedJobIds = async (
  uid: string,
  jobIds: string[]
): Promise<void> => {
  if (!uid) {
    throw new Error(
      "No se pudo identificar al estudiante."
    );
  }

  const uniqueIds = [...new Set(
    jobIds.filter((id) => id.trim().length > 0)
  )];

  await Preferences.set({
    key: getSavedJobsStorageKey(uid),
    value: JSON.stringify(uniqueIds),
  });
};

// Recuperar los detalles de las vacantes guardadas.
export const getSavedJobDetails = async (
  jobIds: string[]
): Promise<Job[]> => {
  const uniqueIds = [...new Set(jobIds)];

  if (uniqueIds.length === 0) {
    return [];
  }

  const results = await Promise.all(
    uniqueIds.map(async (jobId): Promise<Job | null> => {
      const snapshot = await getDocFromServer(
        doc(db, "jobs", jobId)
      );

      if (!snapshot.exists()) {
        return null;
      }

      return {
        ...snapshot.data(),
        id: snapshot.id,
      } as Job;
    })
  );

  return results
    .filter((job): job is Job => job !== null)
    .sort(
      (a, b) =>
        (b.creadoEn?.toMillis() ?? 0) -
        (a.creadoEn?.toMillis() ?? 0)
    );
};
