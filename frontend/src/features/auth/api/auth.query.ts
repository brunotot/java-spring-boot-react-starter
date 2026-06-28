import { api } from "@/infrastructure/api";
import { AppQueryKey } from "@/setup/appQueryKey";
import { type RgoQueryOptionsFactoryCollection } from "@rgo/front-ui";

export const AuthQuery = {
  me: () => ({
    queryKey: [AppQueryKey.Auth.me],
    queryFn: async () => api.Auth.me(),
    retry: false,
  }),
} as const satisfies RgoQueryOptionsFactoryCollection;
