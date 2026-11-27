
import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export interface Coordinates {
  lat: number;
  lng: number;
}

export const useLocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getLocation = async (): Promise<Coordinates | null> => {
    setLoading(true);
    setError("");

    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.requestPermissions();

        if (permissions.location !== "granted") {
          setError("Debes permitir el acceso a tu ubicación.");
          return null;
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch {
      setError(
        "No se pudo obtener la ubicación. Revisa los permisos o introdúcela manualmente."
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
  setError("");
  };

  return {
    getLocation,
    loading,
    error,
    clearError,
  };
};
