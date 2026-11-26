const EARTH_RADIUS_KM = 6371;

// Convertir grados a radianes.
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Calcular la distancia entre dos ubicaciones en kilómetros.
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLng / 2) ** 2;

  const safeA = Math.min(1, Math.max(0, a));

  const c =
    2 * Math.atan2(
      Math.sqrt(safeA),
      Math.sqrt(1 - safeA)
    );

  return EARTH_RADIUS_KM * c;
};

// Formatear la distancia para mostrarla en la interfaz.
export const formatDistance = (
  distance: number
): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
};
