import { sigPageBodyMaxWidth } from "@/features/userSettings/signals/sigPageBody";
import { AppLayoutHeader } from "@/setup/layout/AppLayoutHeader";
import { RgoPage, RgoPageBody } from "@rgo/front-ui";
import { type ReactNode } from "react";

export type AppPageLayoutProps = {
  children: ReactNode;
  overlay?: ReactNode;
};

export function AppPageLayout({ children, overlay }: AppPageLayoutProps) {
  return (
    <RgoPage>
      <AppLayoutHeader />
      <RgoPageBody maxWidth={sigPageBodyMaxWidth.value}>{children}</RgoPageBody>
      {overlay}
    </RgoPage>
  );
}
