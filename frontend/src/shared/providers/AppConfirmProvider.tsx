import { RgoConfirmProvider, type RgoProvider } from "@rgo/front-ui";

export const AppConfirmProvider: RgoProvider = ({ children }) => {
  return <RgoConfirmProvider>{children}</RgoConfirmProvider>;
};
