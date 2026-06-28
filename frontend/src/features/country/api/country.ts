import { type Country } from "@/features/country/models/Country";
import { type CountryFilters } from "@/features/country/models/CountryFilters";
import { type PageableParams, type PageableResponse } from "@rgo/front-ui";
import z from "zod";

export const ApiCountry = z.object({
  find: z.custom<(pageable: PageableParams, filters: CountryFilters) => Promise<PageableResponse<Country>>>(),
  update: z.custom<(country: Country) => Promise<Country>>(),
});

export type ApiCountry = z.infer<typeof ApiCountry>;
