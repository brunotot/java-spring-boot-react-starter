import { LmsLocale, setLocaleLocal, sigLocale } from "@/features/userSettings/signals/sigLocale";
import { setNavLockedLocal, sigNavLocked } from "@/features/userSettings/signals/sigNav";
import { setPageBodyMaxWidthLocal, sigPageBodyMaxWidth } from "@/features/userSettings/signals/sigPageBody";
import { setDarkModeLocal, sigDarkMode } from "@/features/userSettings/signals/sigTheme";
import { LocalStoragePageBodyMaxWidth } from "@/infrastructure/browser/localStorage/LocalStorageSchema";
import { FormToggleButtonField } from "@/shared/components/FormToggleButtonField";
import { useLmsForm } from "@/shared/hooks/useLmsForm";
import { AppPageLayout } from "@/shared/layout/AppPageLayout";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { showSuccessToast } from "@/shared/utils/appToast";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Grid2 as Grid,
} from "@mui/material";
import { RgoForm } from "@rgo/front-ui";
import { Controller } from "react-hook-form";
import z from "zod";

const SettingsForm = z.object({
  locale: LmsLocale,
  darkMode: z.boolean(),
  navLocked: z.boolean(),
  pageBodyMaxWidth: LocalStoragePageBodyMaxWidth,
});

type SettingsForm = z.infer<typeof SettingsForm>;

export function AppPageSettings() {
  const { t } = useLmsTranslation();

  const form = useLmsForm<SettingsForm>({
    schema: () => SettingsForm,
    defaultValues: {
      locale: sigLocale.value,
      darkMode: sigDarkMode.value,
      navLocked: sigNavLocked.value,
      pageBodyMaxWidth: sigPageBodyMaxWidth.value,
    },
  });

  const pageBodyMaxWidthOptions: Array<{ value: SettingsForm["pageBodyMaxWidth"]; label: string }> = [
    { value: "xs", label: t("settings.messages.pageBodyMaxWidthXs") },
    { value: "sm", label: t("settings.messages.pageBodyMaxWidthSm") },
    { value: "md", label: t("settings.messages.pageBodyMaxWidthMd") },
    { value: "lg", label: t("settings.messages.pageBodyMaxWidthLg") },
    { value: "xl", label: t("settings.messages.pageBodyMaxWidthXl") },
    { value: false, label: t("settings.messages.pageBodyMaxWidthNone") },
  ];

  const onSubmit = (data: SettingsForm) => {
    setLocaleLocal(data.locale);
    setDarkModeLocal(data.darkMode);
    setNavLockedLocal(data.navLocked);
    setPageBodyMaxWidthLocal(data.pageBodyMaxWidth);
    showSuccessToast(t("common.messages.save"));
  };

  return (
    <AppPageLayout>
      <Card sx={{ overflow: "hidden" }}>
        <RgoForm form={form} onSubmit={onSubmit}>
          <CardHeader
            title={t("settings.messages.title")}
            sx={{
              borderBottom: "1px solid var(--mui-palette-grey-300)",
            }}
          />

          <CardContent sx={theme => ({ backgroundColor: theme.palette.grey[50] })}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <FormToggleButtonField<SettingsForm, LmsLocale>
                  name="locale"
                  control={form.control}
                  label={t("common.messages.language")}
                  options={LmsLocale.options}
                  renderKey={option => option}
                  renderOption={option =>
                    option === "en" ? t("settings.messages.english") : t("settings.messages.croatian")
                  }
                />
              </Grid>

              <Grid size={12}>
                <FormToggleButtonField<SettingsForm, boolean>
                  name="darkMode"
                  control={form.control}
                  label={t("common.messages.theme")}
                  options={[false, true]}
                  renderKey={option => String(option)}
                  renderOption={option => (option ? t("common.messages.dark") : t("common.messages.light"))}
                />
              </Grid>

              <Grid size={12}>
                <FormToggleButtonField<SettingsForm, SettingsForm["pageBodyMaxWidth"]>
                  name="pageBodyMaxWidth"
                  control={form.control}
                  label={t("settings.messages.pageBodyMaxWidth")}
                  options={pageBodyMaxWidthOptions.map(option => option.value)}
                  renderKey={option => String(option)}
                  renderOption={option => pageBodyMaxWidthOptions.find(item => item.value === option)?.label ?? String(option)}
                  rgoSlotProps={{
                    toggleButtonGroup: {
                      sx: {
                        width: "100%",
                        flexWrap: "wrap",
                        gap: 1,
                        alignItems: "stretch",
                        justifyContent: "flex-start",
                        "& .MuiToggleButton-root": {
                          flex: "0 1 auto",
                          width: "auto",
                          minWidth: 0,
                          maxWidth: "100%",
                          minHeight: "auto",
                          whiteSpace: "normal",
                          lineHeight: 1.25,
                          py: 1,
                        },
                      },
                    },
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="navLocked"
                  control={form.control}
                  render={({ field }) => (
                    <FormControlLabel
                      label={t("settings.messages.lockNavigationBar")}
                      control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>

          <CardActions
            sx={{
              justifyContent: "flex-end",
              p: "1rem 1.5rem",
              borderTop: "1px solid var(--mui-palette-grey-300)",
            }}
          >
            <Button type="submit" variant="contained" disabled={form.submitDisabled}>
              {t("common.messages.save")}
            </Button>
          </CardActions>
        </RgoForm>
      </Card>
    </AppPageLayout>
  );
}
