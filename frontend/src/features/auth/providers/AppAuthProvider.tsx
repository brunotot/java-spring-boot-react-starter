import { AuthQuery } from "@/features/auth/api/auth.query";
import { AppAuthContext } from "@/features/auth/providers/AppAuthContext";
import { api } from "@/infrastructure/api";
import { QUERY_CLIENT } from "@/setup/queryclient";
import { AppQueryKey } from "@/setup/appQueryKey";
import { type RgoProvider } from "@rgo/front-ui";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export const AppAuthProvider: RgoProvider = ({ children }) => {
  const meQuery = useQuery(AuthQuery.me());
  const username = meQuery.data?.username ?? null;
  const role = meQuery.data?.role ?? null;

  const login = React.useCallback(
    async (username: string, password: string) => {
      await api.Auth.login(username, password);
      await meQuery.refetch();
    },
    [meQuery],
  );

  const logout = React.useCallback(async () => {
    await api.Auth.logout();
    QUERY_CLIENT.setQueryData([AppQueryKey.Auth.me], null);
    await meQuery.refetch().catch(() => undefined);
  }, [meQuery]);

  const refetchCurrentUser = React.useCallback(async () => {
    await meQuery.refetch();
  }, [meQuery]);

  return (
    <AppAuthContext.Provider
      value={{
        isAuthenticated: Boolean(meQuery.data),
        isLoading: meQuery.isLoading,
        username,
        role,
        login,
        logout,
        refetchCurrentUser,
      }}
    >
      {children}
    </AppAuthContext.Provider>
  );
};
