import { createPersistentSignal } from "@/features/userSettings/signals/createPersistentSignal";
import { THEME_DARK } from "@/setup/theme/theme.dark";
import { THEME_LIGHT } from "@/setup/theme/theme.light";
import { computed } from "@preact/signals-react";

const darkModeState = createPersistentSignal("darkMode");
export const sigDarkMode = darkModeState.signal;

export const sigTheme = computed(() => (sigDarkMode.value ? THEME_DARK : THEME_LIGHT));

export function setDarkModeLocal(darkMode: boolean): void {
  darkModeState.setLocal(darkMode);
}
