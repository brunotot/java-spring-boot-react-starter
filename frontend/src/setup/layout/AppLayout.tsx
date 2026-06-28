import {
  ensureValidNavWidth,
  setNavCollapsedLocal,
  setNavWidthLocal,
  sigNavCollapsed,
  sigNavLocked,
  sigNavWidth,
} from "@/features/userSettings/signals/sigNav";
import { AppLayoutNav } from "@/setup/layout/AppLayoutNav";
import { AppNavLayoutContext } from "@/setup/layout/AppNavLayoutContext";
import {
  NAV_COLLAPSE_TRIGGER_WIDTH,
  NAV_COLLAPSED_WIDTH,
  NAV_DEFAULT_EXPANDED_WIDTH,
  NAV_MIN_EXPANDED_WIDTH,
} from "@/setup/layout/lmsNav.constants";
import { Box, Dialog, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { Outlet } from "react-router";

export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(sigNavCollapsed.value);
  const [desktopWidth, setDesktopWidth] = React.useState(ensureValidNavWidth(sigNavWidth.value));
  const [desktopResizing, setDesktopResizing] = React.useState(false);
  const navLocked = sigNavLocked.value;

  const desktopExpandedWidth = React.useMemo(() => ensureValidNavWidth(desktopWidth), [desktopWidth]);
  const desktopNavWidth = desktopCollapsed ? NAV_COLLAPSED_WIDTH : desktopExpandedWidth;

  const openMobileNav = React.useCallback(() => {
    setMobileNavOpen(true);
  }, []);

  const closeMobileNav = React.useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const applyCollapsed = React.useCallback((collapsed: boolean) => {
    setDesktopCollapsed(collapsed);
    setNavCollapsedLocal(collapsed);
  }, []);

  const applyWidth = React.useCallback((width: number) => {
    const validWidth = ensureValidNavWidth(width);
    setDesktopWidth(validWidth);
    setNavWidthLocal(validWidth);
  }, []);

  const onToggleCollapsed = React.useCallback(() => {
    if (navLocked) {
      return;
    }

    if (desktopCollapsed) {
      applyCollapsed(false);
      if (desktopExpandedWidth < NAV_MIN_EXPANDED_WIDTH) {
        applyWidth(NAV_DEFAULT_EXPANDED_WIDTH);
      }
      return;
    }

    applyCollapsed(true);
  }, [applyCollapsed, applyWidth, desktopCollapsed, desktopExpandedWidth, navLocked]);

  const onResizeStart = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || navLocked) {
        return;
      }

      if (event.detail > 1) {
        return;
      }

      event.preventDefault();

      const startX = event.clientX;
      const startWidth = desktopCollapsed ? NAV_COLLAPSED_WIDTH : desktopExpandedWidth;

      setDesktopResizing(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const nextWidth = startWidth + (moveEvent.clientX - startX);

        if (nextWidth <= NAV_COLLAPSE_TRIGGER_WIDTH) {
          applyCollapsed(true);
          return;
        }

        if (sigNavCollapsed.value) {
          applyCollapsed(false);
        }

        applyWidth(nextWidth);
      };

      const onMouseUp = () => {
        setDesktopResizing(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [applyCollapsed, applyWidth, desktopCollapsed, desktopExpandedWidth, isMobile, navLocked],
  );

  const onResizeDoubleClick = React.useCallback(() => {
    if (isMobile || navLocked) {
      return;
    }

    applyCollapsed(false);
    applyWidth(NAV_DEFAULT_EXPANDED_WIDTH);
  }, [applyCollapsed, applyWidth, isMobile, navLocked]);

  return (
    <AppNavLayoutContext.Provider value={{ isMobile, openMobileNav }}>
      {!isMobile ? (
        <AppLayoutNav
          width={desktopNavWidth}
          collapsed={desktopCollapsed}
          mobile={false}
          navLocked={navLocked}
          isResizing={desktopResizing}
          onToggleCollapsed={onToggleCollapsed}
          onResizeStart={onResizeStart}
          onResizeDoubleClick={onResizeDoubleClick}
        />
      ) : null}

      <Dialog fullScreen open={isMobile && mobileNavOpen} onClose={closeMobileNav}>
        <AppLayoutNav width="100%" collapsed={false} mobile onNavigate={closeMobileNav} onClose={closeMobileNav} />
      </Dialog>

      <Box
        sx={{
          marginLeft: !isMobile ? `${desktopNavWidth}px` : 0,
          bgcolor: "background.default",
          height: "100vh",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: theme.transitions.create(["margin-left"], {
            duration: theme.transitions.duration.shortest,
          }),
        }}
      >
        <Outlet />
      </Box>
    </AppNavLayoutContext.Provider>
  );
}
