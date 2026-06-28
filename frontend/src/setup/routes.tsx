import { AppPageCountries } from "@/pages/countries/AppPageCountries";
import { AppPageHome } from "@/pages/home/AppPageHome";
import { AppPageLogin } from "@/pages/login/AppPageLogin";
import { AppPageSettings } from "@/pages/settings/AppPageSettings";
import { AppRouteGuardLayout } from "@/setup/route-guards/AppRouteGuardLayout";
import { AppRouteGuardLogin } from "@/setup/route-guards/AppRouteGuardLogin";
import { type AppRouteHandle } from "@/setup/routes.types";
import { Navigate, type RouteObject } from "react-router";

export type AppRouteObject = Omit<RouteObject, "children" | "handle"> & {
  children?: AppRouteObject[];
  handle?: AppRouteHandle;
};

function SettingsIndexRedirect() {
  return <Navigate to="app" replace />;
}

export const APP_ROUTES: AppRouteObject[] = [
  {
    path: "login",
    Component: AppRouteGuardLogin,
    children: [{ path: "", Component: AppPageLogin, handle: { breadcrumb: t => t("common.messages.login") } }],
  },
  {
    path: "",
    Component: AppRouteGuardLayout,
    children: [
      { path: "", Component: AppPageHome, handle: { breadcrumb: t => t("common.messages.home") } },
      {
        path: "countries",
        Component: AppPageCountries,
        handle: { breadcrumb: t => t("common.messages.countries") },
      },
      {
        path: "settings",
        handle: { breadcrumb: t => t("common.messages.settings"), linkable: false },
        children: [
          {
            path: "",
            Component: SettingsIndexRedirect,
          },
          {
            path: "app",
            Component: AppPageSettings,
            handle: { breadcrumb: t => t("navigation.messages.appSettings") },
          },
        ],
      },
    ],
  },
];
