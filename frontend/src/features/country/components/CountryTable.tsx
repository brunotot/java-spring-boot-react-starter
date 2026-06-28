import { useCountryTableColumns } from "@/features/country/hooks/tablecolumns/useCountryTableColumns";
import { type Country } from "@/features/country/models/Country";
import { type CountryFilters } from "@/features/country/models/CountryFilters";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { Box, Card, CardHeader, Typography } from "@mui/material";
import {
  RgoInputText,
  RgoServerTable,
  type PageableParams,
  type PageableResponse,
  type ReactStateSetter,
} from "@rgo/front-ui";
import React from "react";

export type CountryTableProps = {
  data: PageableResponse<Country>;
  filters: CountryFilters;
  pagination: PageableParams;
  onChangeFilters: ReactStateSetter<CountryFilters>;
  onPaginationChange: ReactStateSetter<PageableParams>;
  onEdit: (country: Country) => void;
};

export function CountryTable({
  data,
  filters,
  pagination,
  onChangeFilters,
  onPaginationChange,
  onEdit,
}: CountryTableProps) {
  const { t } = useLmsTranslation();
  const columns = useCountryTableColumns({ onEdit });

  const handleFiltersChange: ReactStateSetter<CountryFilters> = newFilters => {
    React.startTransition(() => {
      onChangeFilters(newFilters);
    });
  };

  const handlePaginationChange: ReactStateSetter<PageableParams> = newPagination => {
    React.startTransition(() => {
      onPaginationChange(newPagination);
    });
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
            <Typography fontWeight={600}>{t("country.messages.title")}</Typography>
            <RgoInputText
              value={filters.searchText}
              onChange={value => {
                handleFiltersChange({ searchText: String(value ?? "") });
                handlePaginationChange({ ...pagination, page: 0 });
              }}
              rgoSlotProps={{
                root: {
                  size: "small",
                  placeholder: t("common.messages.code"),
                },
              }}
            />
          </Box>
        }
        sx={{ p: 2 }}
      />
      <RgoServerTable
        data={data.content}
        count={data.totalElements}
        keyMapper={value => value.code}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        columns={columns}
        stickyMaxHeight="calc(100svh - 254px)"
      />
    </Card>
  );
}
