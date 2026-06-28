import { CountryForm } from "@/features/country/components/CountryForm";
import { type Country } from "@/features/country/models/Country";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { Dialog, DialogActions, DialogContent } from "@mui/material";
import { RgoDialogHeader, type UseFormReturn } from "@rgo/front-ui";

export type CountryFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Country) => void;
  form: UseFormReturn<Country>;
};

export function CountryFormDialog({ open, onClose, onSubmit, form }: CountryFormDialogProps) {
  const { t } = useLmsTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <RgoDialogHeader title={t("country.messages.editCountry")} onClose={onClose} />
      <CountryForm
        form={form}
        onCancel={onClose}
        onSubmit={onSubmit}
        ContentComponent={DialogContent}
        ActionsComponent={DialogActions}
      />
    </Dialog>
  );
}
