export const RESPONSIVE_KPI_GRID_COLUMNS = {
  xs: "1fr",
  sm: "repeat(2, minmax(0, 1fr))",
  xl: "repeat(4, minmax(0, 1fr))",
} as const;

export const RESPONSIVE_TREND_INSIGHTS_GRID_COLUMNS = {
  xs: "1fr",
  xl: "minmax(0, 2fr) minmax(320px, 1fr)",
} as const;
