import { useAuthContext } from "@/features/auth/hooks/contexts/useAuthContext";
import {
  NAV_RESIZE_ACTIVE_OPACITY,
  NAV_RESIZE_HANDLE_WIDTH,
  NAV_RESIZE_HITBOX_WIDTH,
  NAV_RESIZE_HOVER_OPACITY,
} from "@/setup/layout/lmsNav.constants";
import { getLayoutBorderColor } from "@/setup/layout/layout.tokens";
import { useLmsTranslation } from "@/shared/hooks/useLmsTranslation";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { RgoIcon } from "@rgo/front-ui";
import React from "react";
import { useLocation, useNavigate } from "react-router";

// TODO: Move to config or env variable
const APP_NAME = "Leather proizvodnja";
const APP_LOGO_FILE_PATH = "/logo.svg";

type NavEntry =
  | {
      type: "item";
      to?: string;
      label: string;
      icon: React.ReactNode;
      disabled?: boolean;
      disabledTooltip?: string;
    }
  | {
      type: "separator";
      label: string;
    };

type NavItemEntry = Extract<NavEntry, { type: "item" }>;
type NavIconName = React.ComponentProps<typeof RgoIcon>["icon"];

function navIcon(icon: NavIconName): React.ReactNode {
  return <RgoIcon icon={icon} width={20} height={20} />;
}

function navItem(params: Omit<NavItemEntry, "type">): NavItemEntry {
  return {
    type: "item",
    ...params,
  };
}

function disabledNavItem(
  params: Omit<NavItemEntry, "type" | "disabled" | "disabledTooltip">,
  disabledTooltip: string,
): NavItemEntry {
  return navItem({
    ...params,
    disabled: true,
    disabledTooltip,
  });
}

function navSeparator(label: string): NavEntry {
  return {
    type: "separator",
    label,
  };
}

export type AppLayoutNavProps = {
  width: number | string;
  collapsed: boolean;
  mobile: boolean;
  navLocked?: boolean;
  isResizing?: boolean;
  onToggleCollapsed?: () => void;
  onResizeStart?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onResizeDoubleClick?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
};

export function AppLayoutNav({
  width,
  collapsed,
  mobile,
  navLocked = false,
  isResizing = false,
  onToggleCollapsed,
  onResizeStart,
  onResizeDoubleClick,
  onNavigate,
  onClose,
}: AppLayoutNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLmsTranslation();
  const { logout, username } = useAuthContext();
  const [isResizeHovered, setIsResizeHovered] = React.useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = React.useState<null | HTMLElement>(null);
  const isCollapsed = !mobile && collapsed;

  const navEntries = React.useMemo<NavEntry[]>(() => {
    const toBeImplemented = t("navigation.messages.toBeImplemented");

    return [
      navItem({
        to: "/",
        label: t("common.messages.home"),
        icon: navIcon("building-01"),
      }),
      navItem({
        to: "/countries",
        label: t("common.messages.countries"),
        icon: navIcon("globe-02"),
      }),
      disabledNavItem(
        {
          label: t("navigation.messages.articles"),
          icon: navIcon("bar-chart-10"),
        },
        toBeImplemented,
      ),
      disabledNavItem(
        {
          label: t("navigation.messages.buyers"),
          icon: navIcon("user-01"),
        },
        toBeImplemented,
      ),
      navSeparator(t("navigation.messages.receipts")),
      disabledNavItem(
        {
          label: t("navigation.messages.invoices"),
          icon: navIcon("bar-chart-10"),
        },
        toBeImplemented,
      ),
      disabledNavItem(
        {
          label: t("navigation.messages.offers"),
          icon: navIcon("settings-01"),
        },
        toBeImplemented,
      ),
      disabledNavItem(
        {
          label: t("navigation.messages.dispatches"),
          icon: navIcon("building-01"),
        },
        toBeImplemented,
      ),
      navSeparator(t("navigation.messages.settingsSection")),
      disabledNavItem(
        {
          label: t("navigation.messages.company"),
          icon: navIcon("building-01"),
        },
        toBeImplemented,
      ),
      navItem({
        to: "/settings/app",
        label: t("navigation.messages.appSettings"),
        icon: navIcon("settings-01"),
      }),
      navSeparator(t("navigation.messages.actionsSection")),
      disabledNavItem(
        {
          label: t("navigation.messages.report"),
          icon: navIcon("bar-chart-10"),
        },
        toBeImplemented,
      ),
    ];
  }, [t]);

  const onNavigateTo = (to: string) => {
    navigate(to);
    onNavigate?.();
  };

  const onLogout = async () => {
    setAccountAnchorEl(null);
    await logout();
    navigate("/login", { replace: true });
    onNavigate?.();
  };

  const onOpenAccountMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const onCloseAccountMenu = () => {
    setAccountAnchorEl(null);
  };

  return (
    <Box
      sx={{
        width,
        borderRight: "1px solid",
        borderColor: getLayoutBorderColor,
        bgcolor: "background.paper",
        boxShadow: theme => (theme.palette.mode === "light" ? "2px 0 18px -14px rgba(16,24,40,0.45)" : "none"),
        position: mobile ? "relative" : "fixed",
        top: mobile ? "auto" : 0,
        left: mobile ? "auto" : 0,
        height: "100vh",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1200,
      }}
    >
      <Box
        sx={{
          px: isCollapsed ? 1 : 1,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          gap: isCollapsed ? 0 : 1,
          borderBottom: "1px solid",
          borderColor: getLayoutBorderColor,
          minHeight: 65,
        }}
      >
        {isCollapsed && navLocked ? (
          <Box
            component="img"
            src={APP_LOGO_FILE_PATH}
            alt={APP_NAME}
            sx={{
              width: 34,
              height: 34,
              display: "block",
              objectFit: "contain",
            }}
          />
        ) : null}

        {!isCollapsed ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0, ml: 1.5 }}>
            <Box
              component="img"
              src={APP_LOGO_FILE_PATH}
              alt={APP_NAME}
              sx={{
                width: 28,
                height: 28,
                display: "block",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <Typography fontWeight={700} noWrap sx={{ fontSize: 18 }}>
              {APP_NAME}
            </Typography>
          </Box>
        ) : null}

        {!mobile && !navLocked ? (
          <Tooltip title={isCollapsed ? t("common.messages.expand") : t("common.messages.collapse")}>
            <IconButton size="small" onClick={onToggleCollapsed}>
              {isCollapsed ? <ChevronRightRoundedIcon fontSize="small" /> : <ChevronLeftRoundedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        ) : null}

        {mobile ? (
          <IconButton size="small" onClick={onClose} aria-label={t("common.messages.closeNavigation")}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      <List
        sx={theme => ({
          flex: 1,
          overflowY: "auto",
          px: isCollapsed ? 0.5 : 1,
          py: 1,
          scrollbarWidth: "thin",
          scrollbarColor:
            theme.palette.mode === "light"
              ? `${theme.palette.grey[400]} transparent`
              : `${theme.palette.grey[600]} transparent`,
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 999,
            backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[400] : theme.palette.grey[600],
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: theme.palette.mode === "light" ? theme.palette.grey[500] : theme.palette.grey[500],
          },
        })}
      >
        {navEntries.map((entry, index) => {
          if (entry.type === "separator") {
            if (isCollapsed) {
              return (
                <Box key={`sep-${entry.label}-${index}`} sx={{ px: 0.5, py: 0.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      display: "block",
                      textAlign: "center",
                      fontSize: "0.58rem",
                      lineHeight: 1.05,
                      fontWeight: 700,
                      letterSpacing: 0.45,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {entry.label}
                  </Typography>
                </Box>
              );
            }

            return (
              <Box key={`sep-${entry.label}-${index}`} sx={{ px: 2, py: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.8 }}
                >
                  {entry.label}
                </Typography>
              </Box>
            );
          }

          const itemNode = (
            <ListItemButton
              key={`item-${entry.label}-${index}`}
              disabled={Boolean(entry.disabled)}
              selected={Boolean(entry.to && pathname === entry.to)}
              onClick={() => {
                if (entry.to && !entry.disabled) {
                  onNavigateTo(entry.to);
                }
              }}
              sx={
                isCollapsed
                  ? {
                      minHeight: 64,
                      pt: 1.5,
                      pb: 0.75,
                      px: 0.5,
                      mb: 0.5,
                      width: "100%",
                      minWidth: 0,
                      boxSizing: "border-box",
                      borderRadius: 1,
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 0.35,
                      "&.Mui-selected": {
                        color: theme => theme.palette.primary.main,
                        backgroundColor: theme =>
                          theme.palette.mode === "light"
                            ? theme.palette.primary[100]
                            : alpha(theme.palette.primary.main, 0.16),
                        boxShadow: theme =>
                          theme.palette.mode === "light"
                            ? `inset 0 0 0 1px ${theme.palette.primary[200]}`
                            : `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.32)}`,
                        "&:hover": {
                          backgroundColor: theme =>
                            theme.palette.mode === "light"
                              ? theme.palette.primary[200]
                              : alpha(theme.palette.primary.main, 0.22),
                        },
                      },
                      "&.Mui-selected .MuiListItemText-primary": {
                        fontWeight: 700,
                      },
                    }
                  : {
                      mb: 0.5,
                      borderRadius: 1.5,
                      pl: 2,
                      pr: 1.25,
                      "&.Mui-selected .MuiListItemText-primary": {
                        fontWeight: 700,
                      },
                      "&.Mui-selected": {
                        backgroundColor: theme =>
                          theme.palette.mode === "light"
                            ? theme.palette.primary[100]
                            : alpha(theme.palette.primary.main, 0.16),
                        color: theme => theme.palette.primary.main,
                        boxShadow: theme =>
                          theme.palette.mode === "light"
                            ? `inset 0 0 0 1px ${theme.palette.primary[200]}`
                            : `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.32)}`,
                        fontWeight: 600,
                        "&:hover": {
                          backgroundColor: theme =>
                            theme.palette.mode === "light"
                              ? theme.palette.primary[200]
                              : alpha(theme.palette.primary.main, 0.22),
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 6,
                          top: 8,
                          bottom: 8,
                          width: 3,
                          borderRadius: 999,
                          backgroundColor: "currentColor",
                        },
                      },
                    }
              }
            >
              <ListItemIcon
                sx={
                  isCollapsed
                    ? {
                        minWidth: 0,
                        justifyContent: "center",
                        lineHeight: 1,
                        color: "inherit",
                      }
                    : {
                        minWidth: 32,
                        mr: 1,
                        color: "inherit",
                      }
                }
              >
                {entry.icon}
              </ListItemIcon>
              <ListItemText
                primary={entry.label}
                sx={isCollapsed ? { width: "100%", minWidth: 0 } : undefined}
                primaryTypographyProps={
                  isCollapsed
                    ? {
                        variant: "caption",
                        textAlign: "center",
                        lineHeight: 1.1,
                        sx: {
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        },
                      }
                    : undefined
                }
              />
            </ListItemButton>
          );

          if (entry.disabledTooltip) {
            return (
              <Tooltip key={`item-tooltip-${entry.label}-${index}`} title={entry.disabledTooltip} placement="right">
                <Box component="span" sx={{ display: "block" }}>
                  {itemNode}
                </Box>
              </Tooltip>
            );
          }

          return itemNode;
        })}
      </List>

      <Box
        sx={{
          mt: "auto",
          p: isCollapsed ? 0.5 : 1,
          py: isCollapsed ? 1 : 2,
          borderTop: "1px solid",
          borderColor: getLayoutBorderColor,
          display: "flex",
          flexDirection: "column",
          gap: isCollapsed ? 0 : 1,
        }}
      >
        {isCollapsed ? (
          <ListItemButton
            onClick={onOpenAccountMenu}
            sx={{
              minHeight: 64,
              pt: 1.5,
              pb: 0.75,
              px: 0.5,
              mb: 0.5,
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              borderRadius: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.35,
              "&.Mui-selected .MuiListItemText-primary": {
                fontWeight: 700,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              <AccountCircleRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t("common.messages.account")}
              sx={{ width: "100%", minWidth: 0 }}
              primaryTypographyProps={{
                variant: "caption",
                textAlign: "center",
                lineHeight: 1.1,
                sx: {
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                },
              }}
            />
          </ListItemButton>
        ) : (
          <>
            <Box
              sx={theme => ({
                mb: 0.5,
                pl: 2,
                pr: 1.25,
                py: 0.75,
                borderRadius: 1,
                border: "1px solid",
                borderColor: getLayoutBorderColor(theme),
                backgroundColor:
                  theme.palette.mode === "light" ? theme.palette.grey[100] : alpha(theme.palette.grey[700], 0.22),
              })}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.1 }}>
                {t("auth.messages.signedInAs")}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
                {username ?? "-"}
              </Typography>
            </Box>

            <ListItemButton
              sx={theme => ({
                mb: 0.5,
                borderRadius: 1.5,
                pl: 2,
                pr: 1.25,
                color: theme.palette.error.main,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.error.main, 0.08)
                    : alpha(theme.palette.error.main, 0.14),
                boxShadow:
                  theme.palette.mode === "light"
                    ? `inset 0 0 0 1px ${alpha(theme.palette.error.main, 0.22)}`
                    : `inset 0 0 0 1px ${alpha(theme.palette.error.main, 0.28)}`,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? alpha(theme.palette.error.main, 0.14)
                      : alpha(theme.palette.error.main, 0.2),
                },
              })}
              onClick={onLogout}
            >
              <ListItemIcon sx={{ minWidth: 32, mr: 1, color: "inherit" }}>
                <RgoIcon icon="log-out" width={18} height={18} />
              </ListItemIcon>
              <ListItemText primary={t("common.messages.logout")} />
            </ListItemButton>
          </>
        )}
      </Box>

      <Menu
        open={Boolean(accountAnchorEl)}
        anchorEl={accountAnchorEl}
        onClose={onCloseAccountMenu}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              ml: 2,
              mt: 0.5,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("auth.messages.signedInAs")}: {username ?? ""}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={onLogout}
          sx={theme => ({
            borderRadius: 1,
            color: theme.palette.error.main,
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.error.main, 0.08)
                  : alpha(theme.palette.error.main, 0.16),
            },
          })}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <RgoIcon icon="log-out" width={18} height={18} />
          </ListItemIcon>
          <ListItemText>{t("common.messages.logout")}</ListItemText>
        </MenuItem>
      </Menu>

      {!mobile && !navLocked ? (
        <Box
          onMouseDown={onResizeStart}
          onDoubleClick={onResizeDoubleClick}
          onMouseEnter={() => setIsResizeHovered(true)}
          onMouseLeave={() => setIsResizeHovered(false)}
          role="presentation"
          sx={theme => ({
            position: "absolute",
            top: 0,
            right: 0,
            width: NAV_RESIZE_HITBOX_WIDTH,
            height: "100%",
            cursor: "col-resize",
            zIndex: 1300,
            backgroundColor: "transparent",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: NAV_RESIZE_HANDLE_WIDTH,
              height: "100%",
              backgroundColor:
                isResizing || isResizeHovered
                  ? theme.palette.mode === "light"
                    ? theme.palette.grey[500]
                    : theme.palette.grey[400]
                  : "transparent",
              opacity: isResizing ? NAV_RESIZE_ACTIVE_OPACITY : isResizeHovered ? NAV_RESIZE_HOVER_OPACITY : 0,
            },
            transition: theme.transitions.create(["opacity", "background-color"], {
              duration: theme.transitions.duration.shortest,
            }),
          })}
        />
      ) : null}
    </Box>
  );
}
