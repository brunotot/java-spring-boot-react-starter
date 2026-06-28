import { sigLocale } from "@/features/userSettings/signals/sigLocale";
import { RESPONSIVE_KPI_GRID_COLUMNS, RESPONSIVE_TREND_INSIGHTS_GRID_COLUMNS } from "@/setup/theme/responsiveGrids";
import { AppPageLayout } from "@/shared/layout/AppPageLayout";
import { createCurrencyFormatter, formatCompactCurrency } from "@/shared/utils/currencyFormatters";
import { createMonthFormatter, createMonthYearFormatter } from "@/shared/utils/dateFormatters";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import { Box, Card, CardContent, Chip, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type MonthlyIncome = {
  year: number;
  month: number;
  incomeEuro: number;
};

type ChartIncome = MonthlyIncome & {
  monthLabel: string;
  monthYearLabel: string;
};

const MOCK_INCOME_DATA: MonthlyIncome[] = [
  { year: 2026, month: 1, incomeEuro: 18400 },
  { year: 2026, month: 2, incomeEuro: 19250 },
  { year: 2026, month: 3, incomeEuro: 20100 },
  { year: 2026, month: 4, incomeEuro: 19800 },
  { year: 2026, month: 5, incomeEuro: 21450 },
  { year: 2026, month: 6, incomeEuro: 22000 },
  { year: 2026, month: 7, incomeEuro: 21700 },
  { year: 2026, month: 8, incomeEuro: 23100 },
  { year: 2026, month: 9, incomeEuro: 23900 },
  { year: 2026, month: 10, incomeEuro: 24500 },
  { year: 2026, month: 11, incomeEuro: 25250 },
  { year: 2026, month: 12, incomeEuro: 26100 },
];

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "neutral" | "positive" | "negative";
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const accentColor =
    accent === "positive"
      ? "#1F9D55"
      : accent === "negative"
        ? "#D64545"
        : isDarkMode
          ? "rgba(255,255,255,0.72)"
          : "rgba(16,24,40,0.72)";

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderColor: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(16,24,40,0.12)",
        background: isDarkMode
          ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88))",
        boxShadow: isDarkMode ? "none" : "0 1px 2px rgba(16,24,40,0.05), 0 12px 24px -22px rgba(16,24,40,0.32)",
        borderRadius: 1,
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.1 }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.15 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" sx={{ mt: 1.2, display: "block", color: accentColor, fontWeight: 600 }}>
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AppPageHome() {
  const { t } = useLmsTranslation();
  const locale = sigLocale.value;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const surfaceBorderColor = isDarkMode ? "rgba(255,255,255,0.13)" : "rgba(16,24,40,0.1)";
  const elevatedSurfaceBackground = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.98)";
  const mutedSurfaceBackground = isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.96)";
  const chipBorderColor = isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(16,24,40,0.15)";
  const chipBackground = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.98)";
  const chartGridStroke = isDarkMode ? "rgba(255,255,255,0.17)" : "rgba(16,24,40,0.22)";
  const chartTickColor = isDarkMode ? "rgba(255,255,255,0.75)" : "rgba(16,24,40,0.82)";
  const surfaceShadow = isDarkMode ? "none" : "0 1px 2px rgba(16,24,40,0.05), 0 14px 28px -24px rgba(16,24,40,0.35)";

  const monthFormatter = React.useMemo(() => createMonthFormatter(locale), [locale]);

  const monthYearFormatter = React.useMemo(() => createMonthYearFormatter(locale), [locale]);

  const currencyFormatter = React.useMemo(() => createCurrencyFormatter(locale), [locale]);

  const chartData = React.useMemo<ChartIncome[]>(() => {
    if (MOCK_INCOME_DATA.length === 0) {
      return [];
    }

    const latestYear = Math.max(...MOCK_INCOME_DATA.map(item => item.year));
    return MOCK_INCOME_DATA.filter(item => item.year === latestYear)
      .sort((a, b) => a.month - b.month)
      .map(item => {
        const date = new Date(item.year, item.month - 1, 1);
        return {
          ...item,
          monthLabel: monthFormatter.format(date),
          monthYearLabel: monthYearFormatter.format(date),
        };
      });
  }, [monthFormatter, monthYearFormatter]);

  const summary = React.useMemo(() => {
    if (chartData.length === 0) {
      return null;
    }

    const totalIncome = chartData.reduce((sum, item) => sum + item.incomeEuro, 0);
    const averageIncome = totalIncome / chartData.length;
    const bestMonth = chartData.reduce((best, item) => (item.incomeEuro > best.incomeEuro ? item : best), chartData[0]);
    const worstMonth = chartData.reduce(
      (worst, item) => (item.incomeEuro < worst.incomeEuro ? item : worst),
      chartData[0],
    );
    const latestMonth = chartData[chartData.length - 1];
    const previousMonth = chartData[chartData.length - 2] ?? null;
    const latestMonthDelta = previousMonth ? latestMonth.incomeEuro - previousMonth.incomeEuro : null;
    const latestMonthDeltaPercent =
      previousMonth && previousMonth.incomeEuro !== 0
        ? (latestMonth.incomeEuro - previousMonth.incomeEuro) / previousMonth.incomeEuro
        : null;
    const monthsAboveAverage = chartData.filter(item => item.incomeEuro > averageIncome).length;
    const upwardTransitions = chartData
      .slice(1)
      .filter((item, index) => item.incomeEuro > chartData[index].incomeEuro).length;

    return {
      totalIncome,
      averageIncome,
      bestMonth,
      worstMonth,
      latestMonth,
      latestMonthDelta,
      latestMonthDeltaPercent,
      monthsAboveAverage,
      upwardTransitions,
    };
  }, [chartData]);

  if (!summary) {
    return (
      <AppPageLayout>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6">{t("home.messages.noData")}</Typography>
        </Card>
      </AppPageLayout>
    );
  }

  const deltaText =
    summary.latestMonthDelta == null
      ? "-"
      : `${summary.latestMonthDelta >= 0 ? "+" : ""}${currencyFormatter.format(summary.latestMonthDelta)} (${(
          (summary.latestMonthDeltaPercent ?? 0) * 100
        ).toFixed(1)}%)`;

  const deltaAccent =
    summary.latestMonthDelta == null ? "neutral" : summary.latestMonthDelta >= 0 ? "positive" : "negative";

  return (
    <AppPageLayout>
      <Box sx={{ position: "relative", pt: 0, pb: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 1320, mx: "auto", position: "relative" }}>
          <Stack spacing={2.25}>
            <Card
              sx={{
                borderRadius: 1,
                border: `1px solid ${surfaceBorderColor}`,
                backgroundColor: elevatedSurfaceBackground,
                boxShadow: surfaceShadow,
                backdropFilter: "blur(6px)",
              }}
            >
              <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: 0.2 }}>
                      {t("home.messages.title")}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                      {t("home.messages.subtitle")}
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Chip
                      label={`${t("home.messages.totalIncomeYtd")}: ${currencyFormatter.format(summary.totalIncome)}`}
                      sx={{
                        borderRadius: 1.5,
                        border: `1px solid ${chipBorderColor}`,
                        backgroundColor: chipBackground,
                        color: "inherit",
                        fontWeight: 600,
                        height: "auto",
                        minHeight: 32,
                        alignItems: "stretch",
                        maxWidth: { xs: "100%", sm: 360 },
                        ".MuiChip-label": {
                          display: "block",
                          whiteSpace: "normal",
                          textAlign: "left",
                          lineHeight: 1.25,
                          py: 0.75,
                        },
                      }}
                    />
                    <Chip
                      label={`${t("home.messages.averageMonthlyIncome")}: ${currencyFormatter.format(summary.averageIncome)}`}
                      sx={{
                        borderRadius: 1.5,
                        border: `1px solid ${chipBorderColor}`,
                        backgroundColor: chipBackground,
                        color: "inherit",
                        fontWeight: 600,
                        height: "auto",
                        minHeight: 32,
                        alignItems: "stretch",
                        maxWidth: { xs: "100%", sm: 360 },
                        ".MuiChip-label": {
                          display: "block",
                          whiteSpace: "normal",
                          textAlign: "left",
                          lineHeight: 1.25,
                          py: 0.75,
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: RESPONSIVE_KPI_GRID_COLUMNS,
                gap: 2,
              }}
            >
              <KpiCard
                label={t("home.messages.totalIncomeYtd")}
                value={currencyFormatter.format(summary.totalIncome)}
              />
              <KpiCard
                label={t("home.messages.averageMonthlyIncome")}
                value={currencyFormatter.format(summary.averageIncome)}
              />
              <KpiCard
                label={t("home.messages.bestMonth")}
                value={`${summary.bestMonth.monthYearLabel} - ${currencyFormatter.format(summary.bestMonth.incomeEuro)}`}
              />
              <KpiCard
                label={t("home.messages.latestMonth")}
                value={currencyFormatter.format(summary.latestMonth.incomeEuro)}
                hint={deltaText}
                accent={deltaAccent}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: RESPONSIVE_TREND_INSIGHTS_GRID_COLUMNS,
                gap: 2,
              }}
            >
              <Card
                sx={{
                  borderRadius: 1,
                  border: `1px solid ${surfaceBorderColor}`,
                  backgroundColor: mutedSurfaceBackground,
                  boxShadow: surfaceShadow,
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2.25 } }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t("home.messages.monthlyTrend")}
                  </Typography>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 10, right: 16, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                      <XAxis dataKey="monthLabel" tick={{ fill: chartTickColor, fontSize: 12 }} />
                      <YAxis
                        tickFormatter={value => formatCompactCurrency(Number(value))}
                        width={90}
                        tick={{ fill: chartTickColor, fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ stroke: isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(16,24,40,0.3)" }}
                        contentStyle={{
                          borderRadius: 10,
                          border: isDarkMode ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(16,24,40,0.16)",
                          background: isDarkMode ? "rgba(10,20,38,0.95)" : "rgba(255,255,255,0.98)",
                          color: isDarkMode ? "#fff" : "#101828",
                        }}
                        formatter={value => [currencyFormatter.format(Number(value)), t("home.messages.incomeEuro")]}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.monthYearLabel ?? label}
                      />
                      <Line
                        type="monotone"
                        dataKey="incomeEuro"
                        stroke="#36C0CF"
                        strokeWidth={3}
                        dot={{
                          r: 2.5,
                          stroke: "#36C0CF",
                          strokeWidth: 1.2,
                          fill: isDarkMode ? "#0B1220" : "#FFFFFF",
                        }}
                        activeDot={{ r: 6, stroke: "#36C0CF", fill: isDarkMode ? "#0B1220" : "#FFFFFF" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 1,
                  border: `1px solid ${surfaceBorderColor}`,
                  backgroundColor: mutedSurfaceBackground,
                  boxShadow: surfaceShadow,
                }}
              >
                <CardContent sx={{ p: 2.25, height: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 1.75 }}>
                    {t("home.messages.insights")}
                  </Typography>
                  <Stack spacing={1.35}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("home.messages.highestMonth")}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {summary.bestMonth.monthYearLabel} - {currencyFormatter.format(summary.bestMonth.incomeEuro)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("home.messages.lowestMonth")}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {summary.worstMonth.monthYearLabel} - {currencyFormatter.format(summary.worstMonth.incomeEuro)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("home.messages.monthsAboveAverage")}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {summary.monthsAboveAverage}/{chartData.length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("home.messages.upwardTransitions")}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {summary.upwardTransitions}/{Math.max(chartData.length - 1, 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            <Card
              sx={{
                borderRadius: 1,
                border: `1px solid ${surfaceBorderColor}`,
                backgroundColor: mutedSurfaceBackground,
                boxShadow: surfaceShadow,
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2.25 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t("home.messages.monthlyComparison")}
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 10, right: 16, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis dataKey="monthLabel" tick={{ fill: chartTickColor, fontSize: 12 }} />
                    <YAxis
                      tickFormatter={value => formatCompactCurrency(Number(value))}
                      width={90}
                      tick={{ fill: chartTickColor, fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(16,24,40,0.08)" }}
                      contentStyle={{
                        borderRadius: 10,
                        border: isDarkMode ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(16,24,40,0.16)",
                        background: isDarkMode ? "rgba(10,20,38,0.95)" : "rgba(255,255,255,0.98)",
                        color: isDarkMode ? "#fff" : "#101828",
                      }}
                      formatter={value => [currencyFormatter.format(Number(value)), t("home.messages.incomeEuro")]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.monthYearLabel ?? label}
                    />
                    <Bar dataKey="incomeEuro" fill="#29B6F6" radius={[8, 8, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </AppPageLayout>
  );
}
