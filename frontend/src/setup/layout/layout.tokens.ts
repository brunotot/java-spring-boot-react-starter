import { type Theme } from "@mui/material/styles";

export function getLayoutBorderColor(theme: Theme): string {
  return theme.palette.mode === "light" ? theme.palette.grey[300] : theme.palette.divider;
}
