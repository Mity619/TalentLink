import { Preferences } from "@capacitor/preferences";

// Incluye el uid porque varios usuarios pueden compartir el dispositivo.
const draftKey = (uid: string, chatId: string) => `tl_chat_draft_${uid}_${chatId}`;

export const getChatDraft = async (uid: string, chatId: string): Promise<string> => {
  const { value } = await Preferences.get({ key: draftKey(uid, chatId) });
  return value ?? "";
};

export const saveChatDraft = (uid: string, chatId: string, texto: string): Promise<void> =>
  texto.trim()
    ? Preferences.set({ key: draftKey(uid, chatId), value: texto })
    : Preferences.remove({ key: draftKey(uid, chatId) });

export const getChatDrafts = async (
  uid: string,
  chatIds: string[]
): Promise<Record<string, string>> => {
  const entries = await Promise.all(
    chatIds.map(async (id) => [id, await getChatDraft(uid, id)] as const)
  );
  return Object.fromEntries(entries.filter(([, texto]) => texto.trim()));
};
