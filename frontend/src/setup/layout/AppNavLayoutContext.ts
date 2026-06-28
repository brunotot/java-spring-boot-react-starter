import React from "react";

export type AppNavLayoutContextValue = {
  isMobile: boolean;
  openMobileNav: () => void;
};

export const AppNavLayoutContext = React.createContext<AppNavLayoutContextValue | null>(null);

export function useAppNavLayout(): AppNavLayoutContextValue {
  const context = React.useContext(AppNavLayoutContext);

  if (!context) {
    throw new Error("useAppNavLayout must be used within AppNavLayoutContext provider");
  }

  return context;
}
