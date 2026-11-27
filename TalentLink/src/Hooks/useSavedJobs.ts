import { useContext } from "react";

import {
  SavedJobContext,
} from "../Context/SavedJobContext";

export const useSavedJobs = () => {
  const context = useContext(SavedJobContext);

  if (!context) {
    throw new Error(
      "useSavedJobs debe usarse dentro de <SavedJobProvider>"
    );
  }

  return context;
};
