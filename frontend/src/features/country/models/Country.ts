import { type UseLmsFormSchema } from "@/shared/hooks/useLmsForm";
import { type CountryCode } from "@rgo/front-ui";
import z from "zod";

export const Country = z.object({
  code: z.custom<CountryCode>(),
  tax: z.number(),
});

export type Country = z.infer<typeof Country>;

export const DEFAULT_COUNTRY: Country = {
  code: "HR",
  tax: 0,
};

export const countrySchema: UseLmsFormSchema<Country> = t => {
  return Country.extend({
    tax: z.coerce
      .number({ invalid_type_error: t("common.messages.tax") })
      .finite()
      .min(0),
  });
};
