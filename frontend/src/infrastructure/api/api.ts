import { Auth } from "@/features/auth/api/auth.api";
import { Country } from "@/features/country/api/country.api";
import { type ApiSchema } from "@/infrastructure/api/ApiSchema";

export const api: ApiSchema = {
  Auth,
  Country,
};
