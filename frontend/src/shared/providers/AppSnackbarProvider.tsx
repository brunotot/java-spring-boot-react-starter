import { RgoSnackbarProvider, type RgoProvider } from "@rgo/front-ui";

export const AppSnackbarProvider: RgoProvider = ({ children }) => {
  return <RgoSnackbarProvider>{children}</RgoSnackbarProvider>;
};
