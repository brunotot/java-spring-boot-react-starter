import { type CountryFilters } from "@/features/country/models/CountryFilters";
import { api } from "@/infrastructure/api";
import { AppQueryKey } from "@/setup/appQueryKey";
import { type PageableParams, type RgoQueryOptionsFactoryCollection } from "@rgo/front-ui";

export const CountryQuery = {
  find: (pagination: PageableParams, filters: CountryFilters) => ({
    queryKey: [AppQueryKey.Country.countries, pagination, filters],
    queryFn: async () => api.Country.find(pagination, filters),
  }),
} as const satisfies RgoQueryOptionsFactoryCollection;
