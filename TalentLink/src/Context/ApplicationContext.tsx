import {
  createContext,
  useState,
  useRef,
  type ReactNode,
} from "react";

import { useAuth } from "../Hooks/useAuth";

import {
  applyToJob,
  getApplication,
  getApplicationsByUser,
} from "../Helpers/applicationService";

import type { Application } from "../Helpers/applications";

interface ApplicationContextValue {
  applications: Application[];
  loadingApplications: boolean;
  applicationsError: string;
  applyingJobIds: string[];

  loadApplications: () => Promise<void>;
  apply: (jobId: string) => Promise<void>;
  hasApplied: (jobId: string) => boolean;
  isApplying: (jobId: string) => boolean;
}

export const ApplicationContext =
  createContext<ApplicationContextValue | null>(null);

interface ApplicationProviderProps {
  children: ReactNode;
}

export const ApplicationProvider = ({
  children,
}: ApplicationProviderProps) => {
  const { user, profile } = useAuth();

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [loadingApplications, setLoadingApplications] =
    useState(false);

  const [applicationsError, setApplicationsError] =
    useState("");

  const [applyingJobIds, setApplyingJobIds] =
    useState<string[]>([]);

  const appliedJobIds = useRef<Set<string>>(new Set());
  const pendingJobIds = useRef<Set<string>>(new Set());
  const requestId = useRef(0);

  const canApply =
    profile?.activo === true &&
    profile.rol === "student";

  // Consultar las postulaciones del estudiante.
  const loadApplications = async (): Promise<void> => {
    const currentRequest = ++requestId.current;

    if (!user || !canApply) {
      setApplications([]);
      appliedJobIds.current.clear();
      setApplicationsError("");
      setLoadingApplications(false);
      return;
    }

    setLoadingApplications(true);
    setApplicationsError("");

    try {
      const result = await getApplicationsByUser(user.uid);

      if (currentRequest !== requestId.current) return;

      result.forEach((application) => {
        appliedJobIds.current.add(application.jobId);
      });

      setApplications((current) => {
        const merged = new Map(
          current.map((application) => [
            application.id,
            application,
          ])
        );

        result.forEach((application) => {
          merged.set(application.id, application);
        });

        return Array.from(merged.values());
      });
    } catch (error) {
      if (currentRequest !== requestId.current) return;

      console.error(
        "Error al consultar postulaciones:",
        error
      );

      setApplicationsError(
        "No se pudieron cargar las postulaciones."
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoadingApplications(false);
      }
    }
  };

  // Comprobar si el estudiante ya se postuló.
  const hasApplied = (jobId: string): boolean => {
    return appliedJobIds.current.has(jobId);
  };

  // Comprobar si existe una solicitud en curso.
  const isApplying = (jobId: string): boolean => {
    return applyingJobIds.includes(jobId);
  };

  // Registrar una nueva postulación.
  const apply = async (jobId: string): Promise<void> => {
    if (!user || !canApply) {
      throw new Error(
        "No tienes permisos para postularte."
      );
    }

    if (hasApplied(jobId)) {
      throw new Error(
        "Ya te has postulado a esta vacante."
      );
    }

    if (pendingJobIds.current.has(jobId)) {
      return;
    }

    pendingJobIds.current.add(jobId);

    setApplyingJobIds((current) => [
      ...current,
      jobId,
    ]);

    try {
      let applicationId: string;

      try {
        applicationId = await applyToJob(
          jobId,
          user.uid
        );
      } catch (error) {
        // Comprobar si la postulación ya existe,
        // por ejemplo, desde otro dispositivo.
        try {
          const existing = await getApplication(
            jobId,
            user.uid
          );

          if (existing) {
            appliedJobIds.current.add(jobId);

            setApplications((current) => [
              ...current.filter(
                (item) => item.id !== existing.id
              ),
              existing,
            ]);
          }
        } catch (verificationError) {
          console.warn(
            "No se pudo verificar la postulación:",
            verificationError
          );
        }

        throw error;
      }

      appliedJobIds.current.add(jobId);

      const newApplication: Application = {
        id: applicationId,
        jobId,
        uid: user.uid,
        estado: "pendiente",
        creadoEn: null,
      };

      setApplications((current) => [
        ...current.filter(
          (item) => item.id !== applicationId
        ),
        newApplication,
      ]);
    } finally {
      pendingJobIds.current.delete(jobId);

      setApplyingJobIds((current) =>
        current.filter((id) => id !== jobId)
      );
    }
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        loadingApplications,
        applicationsError,
        applyingJobIds,
        loadApplications,
        apply,
        hasApplied,
        isApplying,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
