import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

import {
  getApplicationId,
  type Application,
} from "./applications";

const applicationsCollection = collection(db, "applications");

// Registrar una postulación mediante una transacción.
export const applyToJob = async (
  jobId: string,
  uid: string
): Promise<string> => {
  if (!jobId || !uid) {
    throw new Error(
      "No se pudo identificar la vacante o el estudiante."
    );
  }

  const applicationId = getApplicationId(jobId, uid);

  const applicationRef = doc(
    applicationsCollection,
    applicationId
  );

  const jobRef = doc(db, "jobs", jobId);

  await runTransaction(db, async (transaction) => {
    const applicationSnapshot =
      await transaction.get(applicationRef);

    if (applicationSnapshot.exists()) {
      throw new Error(
        "Ya te has postulado a esta vacante."
      );
    }

    const jobSnapshot = await transaction.get(jobRef);

    if (!jobSnapshot.exists()) {
      throw new Error(
        "La vacante ya no existe."
      );
    }

    if (jobSnapshot.data().estado !== "activa") {
      throw new Error(
        "Esta vacante ya no está disponible."
      );
    }

    transaction.set(applicationRef, {
      jobId,
      uid,
      estado: "pendiente",
      creadoEn: serverTimestamp(),
    });
  });

  return applicationId;
};

// Consultar una postulación específica.
export const getApplication = async (
  jobId: string,
  uid: string
): Promise<Application | null> => {
  const applicationId = getApplicationId(jobId, uid);

  const applicationRef = doc(
    applicationsCollection,
    applicationId
  );

  const snapshot = await getDoc(applicationRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  } as Application;
};

// Consultar las postulaciones de un estudiante.
export const getApplicationsByUser = async (
  uid: string
): Promise<Application[]> => {
  const applicationsQuery = query(
    applicationsCollection,
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(applicationsQuery);

  return snapshot.docs.map((applicationDoc) => ({
    ...applicationDoc.data(),
    id: applicationDoc.id,
  } as Application));
};
