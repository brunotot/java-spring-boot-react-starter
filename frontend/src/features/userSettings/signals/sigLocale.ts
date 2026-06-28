import { LocalStorageLocale } from "@/infrastructure/browser/localStorage/LocalStorageSchema";
import { createPersistentSignal } from "@/features/userSettings/signals/createPersistentSignal";

export const LmsLocale = LocalStorageLocale;
export type LmsLocale = typeof LocalStorageLocale._type;

const localeState = createPersistentSignal("locale");
export const sigLocale = localeState.signal;

export function setLocaleLocal(locale: LmsLocale): void {
  localeState.setLocal(locale);
}
