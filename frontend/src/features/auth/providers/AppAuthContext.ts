import { type UserRole } from "@/features/auth/models/UserRole";
import React from "react";

export type AppAuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  role: UserRole | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchCurrentUser: () => Promise<void>;
};

export const AppAuthContext = React.createContext<AppAuthContextValue | undefined>(undefined);
