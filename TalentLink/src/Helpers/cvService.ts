import { doc, getDoc, serverTimestamp, setDoc, updateDoc, type Timestamp } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";

export const MAX_CV_SIZE_MB = 5;

export interface CvForm {
  resumen: string;
  educacion: string;
  experiencia: string;
}

export interface Cv extends CvForm {
  pdfURL: string;
  pdfNombre: string;
  actualizadoEn: Timestamp | null;
}

const emptyCv: Cv = {
  resumen: "",
  educacion: "",
  experiencia: "",
  pdfURL: "",
  pdfNombre: "",
  actualizadoEn: null,
};

const cvRef = (uid: string) => doc(db, "cvs", uid);
const pdfRef = (uid: string) => ref(storage, `cvs/${uid}.pdf`);

export const validateCvPdf = (file: File): string => {
  if (file.type !== "application/pdf") return "El archivo debe ser un PDF.";
  if (file.size > MAX_CV_SIZE_MB * 1024 * 1024) {
    return `El PDF no puede superar ${MAX_CV_SIZE_MB} MB.`;
  }
  return "";
};

export const validateCvForm = (form: CvForm): string =>
  form.resumen.trim() || form.educacion.trim() || form.experiencia.trim()
    ? ""
    : "Llena al menos un campo de la hoja de vida.";

export const getCv = async (uid: string): Promise<Cv> => {
  const snap = await getDoc(cvRef(uid));
  return snap.exists() ? { ...emptyCv, ...(snap.data() as Partial<Cv>) } : emptyCv;
};

export const saveCvForm = (uid: string, form: CvForm) =>
  setDoc(
    cvRef(uid),
    {
      resumen: form.resumen.trim(),
      educacion: form.educacion.trim(),
      experiencia: form.experiencia.trim(),
      actualizadoEn: serverTimestamp(),
    },
    { merge: true }
  );

export const uploadCvPdf = async (uid: string, file: File): Promise<string> => {
  const error = validateCvPdf(file);
  if (error) throw new Error(error);

  await uploadBytes(pdfRef(uid), file, { contentType: "application/pdf" });
  const url = await getDownloadURL(pdfRef(uid));
  await setDoc(
    cvRef(uid),
    { pdfURL: url, pdfNombre: file.name, actualizadoEn: serverTimestamp() },
    { merge: true }
  );
  await updateDoc(doc(db, "users", uid), { cvURL: url });
  return url;
};

export const deleteCvPdf = async (uid: string) => {
  try {
    await deleteObject(pdfRef(uid));
  } catch (err) {
    if ((err as { code?: string }).code !== "storage/object-not-found") throw err;
  }
  await setDoc(
    cvRef(uid),
    { pdfURL: "", pdfNombre: "", actualizadoEn: serverTimestamp() },
    { merge: true }
  );
  await updateDoc(doc(db, "users", uid), { cvURL: "" });
};
