
import { createContext, useState, type ReactNode } from "react";

import type { Job, JobInput } from "../Helpers/jobs";
import {
  createJob,
  getJobsByAuthor,
  updateJob,
  deleteJob,
} from "../Helpers/jobService";
import { useAuth } from "../Hooks/useAuth";

interface JobContextValue {
  myJobs: Job[];
  loading: boolean;
  loadMyJobs: () => Promise<void>;
  addJob: (data: JobInput) => Promise<void>;
  editJob: (jobId: string, data: JobInput) => Promise<void>;
  removeJob: (jobId: string) => Promise<void>;
}

export const JobContext = createContext<JobContextValue | null>(null);

export const JobProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMyJobs = async (): Promise<void> => {
    if (!user) {
      setMyJobs([]);
      return;
    }

    setLoading(true);

    try {
      const jobs = await getJobsByAuthor(user.uid);
      setMyJobs(jobs);
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

  return (
    <JobContext.Provider
      value={{
        myJobs,
        loading,
        loadMyJobs,
        addJob,
        editJob,
        removeJob,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};
