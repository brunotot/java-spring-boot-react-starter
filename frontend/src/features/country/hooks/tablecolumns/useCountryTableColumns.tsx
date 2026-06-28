import { type Country } from "@/features/country/models/Country";
import { sigLocale } from "@/features/userSettings/signals/sigLocale";
import { useAppCan } from "@/setup/permissions/appPermissions";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  getCountryName,
  RgoIcon,
  RgoNationalityFlag,
  RgoTruncatedText,
  type RgoServerTableColumn,
} from "@rgo/front-ui";
import React from "react";

export type UseCountryTableColumnsProps = {
  onEdit: (country: Country) => void;
};

export function useCountryTableColumns({ onEdit }: UseCountryTableColumnsProps): RgoServerTableColumn<Country>[] {
  const { t } = useLmsTranslation();
  const lang = sigLocale.value;
  const canEditCountry = useAppCan("country:edit");

  return React.useMemo(
    () =>
      [
        {
          id: "code",
          sort: "code",
          widthPctShare: 12.5,
          widthPxMin: 120,
          HeaderComponent: () => t("common.messages.code"),
          BodyComponent: ({ element }) => element.code,
        },
        {
          id: "name",
          widthPctShare: 47.5,
          widthPxMin: 220,
          HeaderComponent: () => t("common.messages.name"),
          BodyComponent: ({ element }) => (
            <RgoTruncatedText
              text={getCountryName(element.code, lang)}
              startIcon={<RgoNationalityFlag countryCode={element.code} />}
              rgoSlotProps={{ iconContainer: { sx: { marginRight: 1.25 } } }}
              maxWidth="100%"
            />
          ),
        },
        {
          id: "tax",
          sort: "tax",
          widthPctShare: 37.5,
          widthPxMin: 160,
          HeaderComponent: () => t("common.messages.tax"),
          BodyComponent: ({ element }) => element.tax,
        },
        {
          id: "actions",
          sticky: "right",
          align: "center",
          widthPctShare: 2.5,
          widthPxMin: 75,
          HeaderComponent: () => t("common.messages.actions"),
          BodyComponent: ({ element }) => {
            const editButton = (
              <IconButton
                aria-label={t("common.messages.edit")}
                disabled={!canEditCountry}
                onClick={() => onEdit(element)}
              >
                <RgoIcon icon="edit-01" width={18} height={18} />
              </IconButton>
            );

            return (
              <Box display="flex" justifyContent="center">
                {canEditCountry ? (
                  editButton
                ) : (
                  <Tooltip title={t("country.messages.editDisabled")}>
                    <span>{editButton}</span>
                  </Tooltip>
                )}
              </Box>
            );
          },
        },
      ] satisfies RgoServerTableColumn<Country>[],
    [onEdit, t, lang, canEditCountry],
  );
}
