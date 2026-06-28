import { ApiAuth } from "@/features/auth/api/auth";
import { ApiCountry } from "@/features/country/api/country";
import z from "zod";

export const ApiSchema = z.object({
  Auth: ApiAuth,
  Country: ApiCountry,
});

export type ApiSchema = z.infer<typeof ApiSchema>;
