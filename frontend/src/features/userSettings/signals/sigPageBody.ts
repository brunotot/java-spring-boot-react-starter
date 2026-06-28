import { type LocalStoragePageBodyMaxWidthValue } from "@/infrastructure/browser/localStorage/LocalStorageSchema";
import { createPersistentSignal } from "@/features/userSettings/signals/createPersistentSignal";

const pageBodyMaxWidthState = createPersistentSignal("pageBodyMaxWidth");
export const sigPageBodyMaxWidth = pageBodyMaxWidthState.signal;

export function setPageBodyMaxWidthLocal(maxWidth: LocalStoragePageBodyMaxWidthValue): void {
  pageBodyMaxWidthState.setLocal(maxWidth);
}
