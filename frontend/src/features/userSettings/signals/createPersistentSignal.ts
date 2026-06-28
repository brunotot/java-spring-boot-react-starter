import { type LocalStorageSchema } from "@/infrastructure/browser/localStorage/LocalStorageSchema";
import { localStorageService } from "@/infrastructure/browser/localStorage/localStorageService";
import { signal, type Signal } from "@preact/signals-react";

type LocalStorageKey = keyof LocalStorageSchema;

export type PersistentSignal<K extends LocalStorageKey> = {
  signal: Signal<LocalStorageSchema[K]>;
  setLocal: (value: LocalStorageSchema[K]) => void;
};

export function createPersistentSignal<K extends LocalStorageKey>(key: K): PersistentSignal<K> {
  const state = signal<LocalStorageSchema[K]>(localStorageService.get(key));

  const setLocal = (value: LocalStorageSchema[K]): void => {
    state.value = value;
    localStorageService.set(key, value);
  };

  return {
    signal: state,
    setLocal,
  };
}
