import { type Country } from "@/features/country/models/Country";
import { sigLocale } from "@/features/userSettings/signals/sigLocale";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { Button, CardActions, CardContent } from "@mui/material";
import {
  getCountryName,
  RgoForm,
  RgoInputNumber,
  RgoLabelBox,
  RgoNationalityFlag,
  RgoTruncatedText,
  type RgoFormBaseProps,
} from "@rgo/front-ui";
import { Controller } from "react-hook-form";

export type CountryFormProps = RgoFormBaseProps<Country> & {
  submitLabel?: string;
  onSubmit: (data: Country) => void;
};

export function CountryForm({
  form,
  onCancel,
  ContentComponent = CardContent,
  ActionsComponent = CardActions,
  onSubmit,
  submitLabel,
}: CountryFormProps) {
  const { t } = useLmsTranslation();
  const lang = sigLocale.value;
  const countryCode = form.watch("code");
  const countryName = countryCode ? getCountryName(countryCode, lang) : "-";

  return (
    <RgoForm form={form} onSubmit={onSubmit}>
      <ContentComponent>
        <RgoLabelBox label={t("common.messages.name")}>
          <RgoTruncatedText
            text={countryName}
            startIcon={countryCode ? <RgoNationalityFlag countryCode={countryCode} /> : undefined}
            rgoSlotProps={{ iconContainer: { sx: { marginRight: 1.25 } } }}
            maxWidth="100%"
          />
        </RgoLabelBox>

        <RgoLabelBox label={t("common.messages.tax")}>
          <Controller
            control={form.control}
            name="tax"
            render={({ field, fieldState }) => (
              <RgoInputNumber
                {...field}
                error={fieldState.invalid}
                helperText={fieldState.error?.message}
                rgoSlotProps={{
                  root: {
                    placeholder: t("common.messages.tax"),
                  },
                }}
              />
            )}
          />
        </RgoLabelBox>
      </ContentComponent>

      <ActionsComponent>
        {onCancel ? (
          <Button color="secondary" variant="outlined" onClick={onCancel}>
            {t("common.messages.cancel")}
          </Button>
        ) : null}
        <Button variant="contained" type="submit" disabled={form.submitDisabled}>
          {submitLabel ?? t("common.messages.save")}
        </Button>
      </ActionsComponent>
    </RgoForm>
  );
}
