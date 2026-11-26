import { useContext } from "react";
import { ApplicationContext } from "../Context/ApplicationContext";

export const useApplications = () => {
  const context = useContext(ApplicationContext);

  if (!context) {
    throw new Error(
      "useApplications debe usarse dentro de <ApplicationProvider>"
    );
  }

  return context;
};
