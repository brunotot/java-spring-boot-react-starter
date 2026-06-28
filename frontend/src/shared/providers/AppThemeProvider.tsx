import { sigTheme } from "@/features/userSettings/signals/sigTheme";
import { RgoThemeProvider, type RgoProvider } from "@rgo/front-ui";

export const AppThemeProvider: RgoProvider = ({ children }) => {
  return <RgoThemeProvider theme={sigTheme.value}>{children}</RgoThemeProvider>;
};
