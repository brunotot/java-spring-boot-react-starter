import { AppAuthContext } from "@/features/auth/providers/AppAuthContext";
import React from "react";

export function useAuthContext() {
  const context = React.useContext(AppAuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AppAuthProvider");
  }
  return context;
}
