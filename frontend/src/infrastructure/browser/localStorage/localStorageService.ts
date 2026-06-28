import { LocalStorageSchema } from "@/infrastructure/browser/localStorage/LocalStorageSchema";
import { RgoLocalStorageService } from "@rgo/front-ui";

export const localStorageService = new RgoLocalStorageService(LocalStorageSchema, {
  darkMode: true,
  locale: "hr",
  navCollapsed: false,
  navWidth: 240,
  navLocked: true,
  pageBodyMaxWidth: false,
});
