import { CountryQuery } from "@/features/country/api/country.query";
import { CountryFormDialog } from "@/features/country/components/CountryFormDialog";
import { CountryTable } from "@/features/country/components/CountryTable";
import { type Country, countrySchema, DEFAULT_COUNTRY } from "@/features/country/models/Country";
import { DEFAULT_COUNTRY_FILTERS, type CountryFilters } from "@/features/country/models/CountryFilters";
import { api } from "@/infrastructure/api";
import { AppQueryKey } from "@/setup/appQueryKey";
import { useLmsForm } from "@/shared/hooks/useLmsForm";
import { AppPageLayout } from "@/shared/layout/AppPageLayout";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { AppQueryErrorLoaderSuspense } from "@/shared/providers/AppQueryErrorLoaderSuspense";
import { showErrorToast, showSuccessToast } from "@/shared/utils/appToast";
import { DEFAULT_PAGINATION_OPTIONS, type PageableParams } from "@rgo/front-ui";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

export function AppPageCountries() {
  const { t } = useLmsTranslation();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = React.useState<PageableParams>({
    ...DEFAULT_PAGINATION_OPTIONS,
    rowsPerPage: 20,
    sortBy: "code",
  });
  const [filters, setFilters] = React.useState<CountryFilters>(DEFAULT_COUNTRY_FILTERS);
  const [open, setOpen] = React.useState(false);

  const { data: countries } = useSuspenseQuery(CountryQuery.find(pagination, filters));

  const form = useLmsForm({
    schema: countrySchema,
    defaultValues: DEFAULT_COUNTRY,
  });

  const updateMutation = useMutation({
    mutationFn: async (request: Country) => {
      return await api.Country.update(request);
    },
    onSuccess: async () => {
      showSuccessToast(t("country.messages.updateSuccess"));
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: [AppQueryKey.Country.countries] });
    },
    onError: () => {
      showErrorToast(t("country.messages.updateFailed"));
    },
  });

  const onEdit = (country: Country) => {
    form.reset(country);
    setOpen(true);
  };

  const onSubmit = (data: Country) => {
    updateMutation.mutate(data);
  };

  return (
    <AppPageLayout
      overlay={<CountryFormDialog open={open} onClose={() => setOpen(false)} onSubmit={onSubmit} form={form} />}
    >
      <AppQueryErrorLoaderSuspense>
        <CountryTable
          data={countries}
          filters={filters}
          pagination={pagination}
          onPaginationChange={setPagination}
          onChangeFilters={setFilters}
          onEdit={onEdit}
        />
      </AppQueryErrorLoaderSuspense>
    </AppPageLayout>
  );
}
