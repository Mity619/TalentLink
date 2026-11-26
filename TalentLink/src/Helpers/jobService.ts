import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit,
  startAfter,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Job, JobInput, Modalidad } from "./jobs";
import { validateJob } from "./validators";

const jobsCollection = collection(db, "jobs");

const JOBS_PAGE_SIZE = 10;

export interface JobFilters {
  area?: string;
  modalidad?: Modalidad;
}

export interface JobsPage {
  jobs: Job[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

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

// Consultar vacantes activas con filtros y paginación.
export const getActiveJobs = async (
  filters: JobFilters = {},
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<JobsPage> => {
  const constraints: QueryConstraint[] = [
    where("estado", "==", "activa"),
  ];

  if (filters.area?.trim()) {
    constraints.push(
      where("area", "==", filters.area.trim())
    );
  }

  if (filters.modalidad) {
    constraints.push(
      where("modalidad", "==", filters.modalidad)
    );
  }

  constraints.push(orderBy("creadoEn", "desc"));

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  constraints.push(limit(JOBS_PAGE_SIZE + 1));

  const jobsQuery = query(
    jobsCollection,
    ...constraints
  );

  const snapshot = await getDocs(jobsQuery);

  const hasMore = snapshot.docs.length > JOBS_PAGE_SIZE;

  const pageDocs = snapshot.docs.slice(0, JOBS_PAGE_SIZE);

  const jobs = pageDocs.map((jobDoc) => ({
    ...jobDoc.data(),
    id: jobDoc.id,
  } as Job));

  return {
    jobs,
    lastDoc: pageDocs[pageDocs.length - 1] ?? null,
    hasMore,
  };
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
