import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { type LmsTranslationFn } from "@/shared/utils/i18nutils";
import { useRgoForm, type UseFormProps, type UseFormReturn, type UseFormSchema } from "@rgo/front-ui";
import type { FieldValues } from "react-hook-form";

export type UseLmsFormSchema<T extends FieldValues = FieldValues> = UseFormSchema<T, LmsTranslationFn>;

export type UseLmsFormProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  UseFormProps<TFieldValues, LmsTranslationFn>,
  "t"
>;

export function useLmsForm<TFieldValues extends FieldValues = FieldValues>(
  props: UseLmsFormProps<TFieldValues>,
): UseFormReturn<TFieldValues> {
  const { t } = useLmsTranslation();

  return useRgoForm<TFieldValues, LmsTranslationFn>({
    t,
    ...props,
  });
}
