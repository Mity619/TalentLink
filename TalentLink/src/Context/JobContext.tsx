import {
  createContext,
  useState,
  useRef,
  type ReactNode,
} from "react";

import type { Job, JobInput } from "../Helpers/jobs";
import {
  createJob,
  getJobsByAuthor,
  updateJob,
  deleteJob,
  getActiveJobs,
  type JobFilters,
  type JobsPage,
} from "../Helpers/jobService";
import { useAuth } from "../Hooks/useAuth";

interface JobContextValue {
  // Gestión de vacantes propias (US8).
  myJobs: Job[];
  loading: boolean;
  refreshError: string;
  loadMyJobs: () => Promise<void>;
  addJob: (data: JobInput) => Promise<void>;
  editJob: (jobId: string, data: JobInput) => Promise<void>;
  removeJob: (jobId: string) => Promise<void>;

  // Consulta de vacantes disponibles (US9).
  availableJobs: Job[];
  filters: JobFilters;
  loadingAvailable: boolean;
  availableError: string;
  hasMore: boolean;
  loadAvailableJobs: (filters?: JobFilters) => Promise<void>;
  loadMoreJobs: () => Promise<void>;
}

export const JobContext = createContext<JobContextValue | null>(null);

export const JobProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  // Estados del listado general de vacantes.
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<JobFilters>({});
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [availableError, setAvailableError] = useState("");
  const [hasMore, setHasMore] = useState(false);

  const lastDoc = useRef<JobsPage["lastDoc"]>(null);
  const requestId = useRef(0);
  const loadingMore = useRef(false);

  const loadMyJobs = async (): Promise<void> => {
    setRefreshError("");

    if (!user) {
        setMyJobs([]);
        return;
    }

    setLoading(true);

    try {
        const jobs = await getJobsByAuthor(user.uid);
        setMyJobs(jobs);
    } catch {
        setRefreshError(
        "No se pudo actualizar el listado de vacantes."
        );
    } finally {
        setLoading(false);
    }
};

  const addJob = async (data: JobInput): Promise<void> => {
    if (!user) {
      throw new Error("Debes iniciar sesión.");
    }

    await createJob(data, user.uid);
    await loadMyJobs();
  };

  const editJob = async (
    jobId: string,
    data: JobInput
  ): Promise<void> => {
    await updateJob(jobId, data);
    await loadMyJobs();
  };

  const removeJob = async (jobId: string): Promise<void> => {
    await deleteJob(jobId);
    await loadMyJobs();
  };


    // Cargar la primera página de vacantes disponibles.
    const loadAvailableJobs = async (
    newFilters: JobFilters = filters
    ): Promise<void> => {
    const currentRequest = ++requestId.current;

    loadingMore.current = false;
    lastDoc.current = null;

    setFilters(newFilters);
    setAvailableJobs([]);
    setHasMore(false);
    setAvailableError("");
    setLoadingAvailable(true);

    try {
        const page = await getActiveJobs(newFilters);

        if (currentRequest !== requestId.current) return;

        setAvailableJobs(page.jobs);
        lastDoc.current = page.lastDoc;
        setHasMore(page.hasMore);
    } catch (error) {
        if (currentRequest !== requestId.current) return;

        console.error("Error al consultar vacantes:", error);

        setAvailableError(
        "No se pudieron cargar las vacantes."
        );
    } finally {
        if (currentRequest === requestId.current) {
        setLoadingAvailable(false);
        }
    }
    };

    // Cargar la siguiente página de vacantes.
    const loadMoreJobs = async (): Promise<void> => {
    if (
        loadingAvailable ||
        loadingMore.current ||
        !hasMore ||
        !lastDoc.current
    ) {
        return;
    }

    const currentRequest = requestId.current;

    loadingMore.current = true;

    setLoadingAvailable(true);
    setAvailableError("");

    try {
        const page = await getActiveJobs(
        filters,
        lastDoc.current
        );

        if (currentRequest !== requestId.current) return;

        setAvailableJobs((current) => [
        ...current,
        ...page.jobs.filter(
            (job) => !current.some((item) => item.id === job.id)
        ),
        ]);

        lastDoc.current = page.lastDoc;
        setHasMore(page.hasMore);
    } catch (error) {
        if (currentRequest !== requestId.current) return;

        console.error("Error al cargar más vacantes:", error);

        setAvailableError(
        "No se pudieron cargar más vacantes."
        );
    } finally {
        if (currentRequest === requestId.current) {
        loadingMore.current = false;
        setLoadingAvailable(false);
        }
    }
    };

  return (
    <JobContext.Provider
    value={{
        myJobs,
        loading,
        refreshError,
        loadMyJobs,
        addJob,
        editJob,
        removeJob,

        availableJobs,
        filters,
        loadingAvailable,
        availableError,
        hasMore,
        loadAvailableJobs,
        loadMoreJobs,
    }}
    >
      {children}
    </JobContext.Provider>
  );
};
