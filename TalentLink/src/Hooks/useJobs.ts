
import { useContext } from "react";
import { JobContext } from "../Context/JobContext";

export const useJobs = () => {
  const ctx = useContext(JobContext);

  if (!ctx) {
    throw new Error("useJobs debe usarse dentro de <JobProvider>");
  }

  return ctx;
};
