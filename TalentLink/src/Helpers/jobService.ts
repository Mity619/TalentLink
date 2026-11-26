import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Job, JobInput } from "./jobs";
import { validateJob } from "./validators";

const jobsCollection = collection(db, "jobs");

// Normalizar los datos de la vacante.
const normalizeJob = (data: JobInput): JobInput => ({
  titulo: data.titulo.trim(),
  descripcion: data.descripcion.trim(),
  empresa: data.empresa.trim(),
  area: data.area.trim(),
  modalidad: data.modalidad,
  ciudad: data.ciudad.trim(),
  lat: data.lat,
  lng: data.lng,
});

// Crear una vacante.
export const createJob = async (
  data: JobInput,
  autorUid: string
): Promise<string> => {
  const errors = validateJob(data);

  if (Object.keys(errors).length > 0) {
    throw new Error("Los datos de la vacante no son válidos.");
  }

  if (!autorUid) {
    throw new Error("No se ha identificado al usuario.");
  }

  const jobRef = await addDoc(jobsCollection, {
    ...normalizeJob(data),
    autorUid,
    estado: "activa",
    creadoEn: serverTimestamp(),
  });

  return jobRef.id;
};

// Consultar una vacante por su ID.
export const getJobById = async (
  jobId: string
): Promise<Job | null> => {
  const jobRef = doc(db, "jobs", jobId);
  const snapshot = await getDoc(jobRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.data(),
    id: snapshot.id,
  } as Job;
};

// Consultar las vacantes de un reclutador.
export const getJobsByAuthor = async (
  autorUid: string
): Promise<Job[]> => {
  const jobsQuery = query(
    jobsCollection,
    where("autorUid", "==", autorUid)
  );

  const snapshot = await getDocs(jobsQuery);

  return snapshot.docs.map((jobDoc) => ({
    ...jobDoc.data(),
    id: jobDoc.id,
  } as Job));
};

// Actualizar una vacante.
export const updateJob = async (
  jobId: string,
  data: JobInput
): Promise<void> => {
  const errors = validateJob(data);

  if (Object.keys(errors).length > 0) {
    throw new Error("Los datos de la vacante no son válidos.");
  }

  const jobRef = doc(db, "jobs", jobId);

  await updateDoc(jobRef, {
    ...normalizeJob(data),
  });
};

// Eliminar una vacante.
export const deleteJob = async (
  jobId: string
): Promise<void> => {
  const jobRef = doc(db, "jobs", jobId);

  await deleteDoc(jobRef);
};
