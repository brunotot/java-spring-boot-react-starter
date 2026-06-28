import { sigPageBodyMaxWidth } from "@/features/userSettings/signals/sigPageBody";
import { useAppNavLayout } from "@/setup/layout/AppNavLayoutContext";
import { getLayoutBorderColor } from "@/setup/layout/layout.tokens";
import { type AppRouteHandle } from "@/setup/routes.types";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Box, Breadcrumbs, Container, IconButton, Link, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink, useMatches } from "react-router";

export function AppLayoutHeader() {
  const matches = useMatches();
  const { t } = useLmsTranslation();
  const { isMobile, openMobileNav } = useAppNavLayout();

  const breadcrumbs = React.useMemo(
    () =>
      matches
        .map(match => {
          const handle = match?.handle as AppRouteHandle | undefined;
          return handle?.breadcrumb
            ? {
                label: handle.breadcrumb(t, match.params),
                to: match.pathname,
                linkable: handle.linkable ?? true,
              }
            : null;
        })
        .filter((breadcrumb): breadcrumb is { label: string; to: string; linkable: boolean } => Boolean(breadcrumb)),
    [matches, t],
  );

  return (
    <Box
      sx={{
        minHeight: 64,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: getLayoutBorderColor,
        position: "sticky",
        top: 0,
        zIndex: theme => theme.zIndex.appBar,
      }}
    >
      <Container maxWidth={sigPageBodyMaxWidth.value}>
        <Box
          sx={{
            minHeight: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            {isMobile ? (
              <IconButton onClick={openMobileNav} size="small" aria-label={t("common.messages.openNavigation")}>
                <MenuRoundedIcon fontSize="small" />
              </IconButton>
            ) : null}

            {breadcrumbs.length > 0 ? (
              <Breadcrumbs aria-label="breadcrumbs" sx={{ minWidth: 0 }}>
                {breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  if (isLast) {
                    return (
                      <Typography
                        key={`${breadcrumb.label}-${index}`}
                        component="span"
                        fontWeight={600}
                        color="text.primary"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {breadcrumb.label}
                      </Typography>
                    );
                  }

                  if (!breadcrumb.linkable) {
                    return (
                      <Typography
                        key={`${breadcrumb.label}-${index}`}
                        component="span"
                        fontWeight={400}
                        color="text.secondary"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {breadcrumb.label}
                      </Typography>
                    );
                  }

                  return (
                    <Link
                      key={`${breadcrumb.label}-${index}`}
                      component={RouterLink}
                      to={breadcrumb.to}
                      underline="hover"
                      color="text.secondary"
                      whiteSpace="nowrap"
                      sx={{ minWidth: 0 }}
                    >
                      {breadcrumb.label}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            ) : null}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
