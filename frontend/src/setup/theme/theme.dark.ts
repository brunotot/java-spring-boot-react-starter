import { THEME_LIGHT } from "@/setup/theme/theme.light";
import { createDarkTheme } from "@rgo/front-ui";

export const THEME_DARK = createDarkTheme(THEME_LIGHT, {
  palette: {
    background: {
      paper: THEME_LIGHT.palette.grey[800],
      default: THEME_LIGHT.palette.grey[900],
    },
    text: {
      primary: "rgba(255, 255, 255, 0.87)",
      secondary: "rgba(255, 255, 255, 0.6)",
      disabled: "rgba(255, 255, 255, 0.38)",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
});
