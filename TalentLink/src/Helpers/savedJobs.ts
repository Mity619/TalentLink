export interface SavedJob {
  id: string;
  uid: string;
  jobId: string;
}

// Generar el identificador de una vacante guardada.
export const getSavedJobId = (
  uid: string,
  jobId: string
): string => {
  return `${uid}_${jobId}`;
};

// Generar la clave de almacenamiento local por usuario.
export const getSavedJobsStorageKey = (
  uid: string
): string => {
  return `tl_saved_jobs_${uid}`;
};
