import { AppAuthProvider } from "@/features/auth/providers/AppAuthProvider";
import { AppAxiosProvider } from "@/shared/providers/AppAxiosProvider";
import { AppConfirmProvider } from "@/shared/providers/AppConfirmProvider";
import { AppIconsProvider } from "@/shared/providers/AppIconsProvider";
import { AppLocalizationProvider } from "@/shared/providers/AppLocalizationProvider";
import { AppQueryClientProvider } from "@/shared/providers/AppQueryClientProvider";
import { AppQueryErrorLoaderSuspense } from "@/shared/providers/AppQueryErrorLoaderSuspense";
import { AppSnackbarProvider } from "@/shared/providers/AppSnackbarProvider";
import { AppThemeProvider } from "@/shared/providers/AppThemeProvider";
import { type RgoProvider } from "@rgo/front-ui";

export const APP_GLOBAL_PROVIDERS: RgoProvider[] = [
  AppThemeProvider,
  AppIconsProvider,
  AppLocalizationProvider,
  AppConfirmProvider,
  AppSnackbarProvider,
  AppQueryClientProvider,
  AppQueryErrorLoaderSuspense,
  AppAxiosProvider,
  AppAuthProvider,
];
