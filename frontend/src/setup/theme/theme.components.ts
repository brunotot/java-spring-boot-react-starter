import { type Theme } from "@mui/material";
import { DateFormat } from "@rgo/front-ui";

const INPUT_PADDING = "8px 16px";

function container() {
  return document.fullscreenElement ?? document.body;
}

export const THEME_COMPONENTS: Theme["components"] = {
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "unset",
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      action: {
        marginBottom: "4px",
      },
      icon: {
        //padding: 0,
      },
      message: {
        //padding: 0,
      },
      root: {
        alignItems: "center",
      },
    },
  },
  MuiAutocomplete: {
    defaultProps: {
      fullWidth: true,
      slotProps: {
        popper: {
          container,
        },
      },
      sx: {
        "& .MuiInputBase-root": {
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
        },
        "& .MuiAutocomplete-input": {
          paddingLeft: "16px !important",
        },
        "& .MuiAutocomplete-noOptions": {
          padding: "8px 16px",
        },
      },
    },
  },
  MuiButton: {
    defaultProps: {
      size: "large",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        minWidth: "fit-content",
        textTransform: "none",
        fontWeight: 600,
        "&.MuiButton-outlined.MuiButton-colorSecondary:hover": {
          backgroundColor: theme.palette.grey[100],
        },
        "&.MuiButton-sizeSmall": {
          minHeight: 24,
        },
        "&.MuiButton-sizeMedium": {
          minHeight: 32,
        },
        "&.MuiButton-sizeLarge": {
          minHeight: 48,
        },
        "&.MuiButton-outlined.MuiButton-colorSecondary:not(:disabled)": {
          color: theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.common.black,
          borderColor: theme.palette.grey[300],
        },
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: "none",
        border: `1px solid ${theme.palette.grey[300]}`,
        backgroundImage: "unset",
      }),
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      title: {
        fontWeight: 600,
        fontSize: "1rem",
      },
    },
  },

  MuiDatePicker: {
    defaultProps: {
      format: DateFormat.CLIENT_DATE,
    },
  },

  MuiDateTimePicker: {
    defaultProps: {
      ampm: false,
      format: DateFormat.CLIENT_DATE_TIME,
      timeSteps: { minutes: 1 },
      slotProps: {
        layout: {
          sx: {
            "& .MuiMultiSectionDigitalClockSection-root": {
              width: 55,
              overflowY: "scroll",
              overflowX: "hidden",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "var(--mui-palette-grey-400)",
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
            },
          },
        },
      },
      sx: {
        "& .MuiInputBase-input": {
          paddingRight: 0,
        },
        "& .MuiInputAdornment-positionEnd": {
          marginLeft: 0,
        },
      },
    },
  },

  MuiTimePicker: {
    defaultProps: {
      ampm: false,
      timeSteps: { minutes: 1 },
      slotProps: {
        layout: {
          sx: {
            "& .MuiMultiSectionDigitalClockSection-root": {
              width: 55,
              overflowY: "scroll",
              overflowX: "hidden",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "var(--mui-palette-grey-400)",
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
            },
          },
        },
      },
    },
  },

  MuiDialog: {
    defaultProps: {
      fullWidth: true,
      disableRestoreFocus: true,
      container,
      // Previously we had keepMounted: true for Dialogs but now we've realized it's actually a footgun in many cases,
      // so we've removed it. If you have a specific Dialog that needs it, please set it explicitly on that Dialog.
      // Use keepMounted: true when you want to preserve the state of the Dialog content when it's closed.
      // keepMounted: true,
    },
    styleOverrides: {
      paper: ({ ownerState }) => {
        const maxWidthMap = {
          xs: "472px",
          sm: "610px",
          md: "720px",
          lg: "816px",
          xl: "1536px",
        } as const;

        return {
          maxWidth:
            (ownerState.maxWidth &&
              typeof ownerState.maxWidth === "string" &&
              maxWidthMap[ownerState.maxWidth as keyof typeof maxWidthMap]) ||
            undefined,
        };
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: "16px 24px",
        position: "sticky",
        bottom: 0,
        zIndex: 1,
        backgroundColor: theme.palette.background.paper,
        borderTop: `thin solid ${theme.palette.grey[300]}`,
      }),
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "24px",
        backgroundColor: theme.palette.grey[50],
      }),
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      input: {
        padding: INPUT_PADDING,
      },
    },
  },
  MuiInput: {
    styleOverrides: {
      input: {
        padding: INPUT_PADDING,
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: ({ theme }) => ({
        "&.Mui-disabled": {
          WebkitTextFillColor: theme.palette.grey[600],
        },
      }),
      root: ({ theme }) => ({
        minHeight: "48px",
        backgroundColor: theme.palette.background.paper,
        "&.Mui-disabled": {
          backgroundColor: theme.palette.grey[100],
        },
        "&.MuiInputBase-multiline": {
          padding: 0,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.grey[300],
        },
        "&.MuiInputBase-sizeSmall": {
          minHeight: "32px",
        },
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        marginTop: 8,
      },
    },
    defaultProps: {
      container,
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      input: {
        padding: INPUT_PADDING,
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        padding: "8px 12px !important",
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      select: {
        padding: INPUT_PADDING,
      },
    },
    defaultProps: {
      MenuProps: {
        sx: {
          "& .MuiMenuItem-root": {
            //height: 50,
          },
        },
        PaperProps: {
          sx: {
            maxHeight: 333,
          },
        },
        MenuListProps: {
          sx: {
            "& .MuiMenuItem-root": {
              //paddingBlock: "4px",
              //paddingInline: 2,
            },
          },
        },
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: ({ theme }) => ({
        width: 50,
        height: 24,
        padding: 0,
        "& .MuiSwitch-switchBase": {
          padding: 0,
          margin: 3,
          transitionDuration: "300ms",
          "&.Mui-checked": {
            transform: "translateX(26px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
              backgroundColor: theme.palette.primary.main,
              opacity: 1,

              ...theme.applyStyles("dark", {
                backgroundColor: theme.palette.primary.main,
              }),
            },
            "&.Mui-disabled + .MuiSwitch-track": {
              opacity: 0.5,
            },
          },
          "&.Mui-focusVisible .MuiSwitch-thumb": {
            color: theme.palette.primary.main,
          },
          "&.Mui-disabled .MuiSwitch-thumb": {
            color: theme.palette.grey[100],
            ...theme.applyStyles("dark", {
              color: theme.palette.grey[600],
            }),
          },
          "&.Mui-disabled + .MuiSwitch-track": {
            opacity: 0.7,
            ...theme.applyStyles("dark", {
              opacity: 0.3,
            }),
          },
        },
        "& .MuiSwitch-thumb": {
          boxSizing: "border-box",
          width: 18,
          height: 18,
        },
        "& .MuiSwitch-track": {
          borderRadius: 16,
          backgroundColor: theme.palette.grey[200],
          opacity: 1,
          border: `1px solid ${theme.palette.grey[300]}`,
          transition: theme.transitions.create(["background-color"], {
            duration: 500,
          }),
          ...theme.applyStyles("dark", {
            backgroundColor: theme.palette.grey[800],
            borderColor: theme.palette.grey[600],
          }),
        },
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        "& .MuiTabs-indicator": {
          backgroundColor: "var(--mui-palette-grey-700)",
        },
        "& .MuiTab-root": {
          color: "var(--mui-palette-grey-700)",
          opacity: 0.6,
          "&.Mui-selected": {
            color: "var(--mui-palette-grey-700)",
            fontWeight: "bold",
            opacity: 1,
          },
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& > tbody > tr:nth-child(odd of :not([data-accordion]))": {
          backgroundColor: theme.palette.mode === "light" ? "#F7F7F7" : "#2A3645",
        },
        "& > tbody > tr:nth-child(odd of :not([data-accordion])) + tr[data-accordion]": {
          backgroundColor: theme.palette.mode === "light" ? "#F7F7F7" : "#2A3645",
        },
        "& > tbody > tr:nth-child(even of :not([data-accordion]))": {
          backgroundColor: theme.palette.mode === "light" ? "#FFFFFF" : "#1D293A",
        },
        "& > tbody > tr:nth-child(even of :not([data-accordion])) + tr[data-accordion]": {
          backgroundColor: theme.palette.mode === "light" ? "#FFFFFF" : "#1D293A",
        },
        "& > tbody > tr:not([data-accordion]):hover": {
          backgroundColor: "var(--mui-palette-primary-50)",
        },
        "& > thead > th": {
          fontWeight: 600,
        },
        "& > tbody > tr > td.MuiTableCell-sizeSmall": {
          padding: "6px",
        },
        "& > thead > tr > th.MuiTableCell-sizeSmall": {
          padding: "8px 6px",
        },
      }),
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.grey[500],
        borderTop: `thin solid ${theme.palette.grey[300]}`,
      }),
      toolbar: ({ theme }) => ({
        paddingLeft: "16px !important",
        paddingRight: "16px !important",

        "& .MuiTablePagination-select": {
          marginRight: "12px",
          marginLeft: "0px",
        },
        "& .MuiTablePagination-select  .MuiSelect-select": {
          margin: 0,
          padding: "8px 24px 8px 8px",
          color: theme.palette.text.primary,
        },

        "& .MuiTablePagination-displayedRows ": {
          margin: "0 12px",
          color: theme.palette.text.primary,
        },

        "& .MuiTablePagination-actions ": {
          marginLeft: "12px",
          color: theme.palette.text.primary,
        },
      }),
    },
  },
  MuiTextField: {
    defaultProps: {
      fullWidth: true,
    },
  },
  MuiGrid2: {
    styleOverrides: {
      root: {
        display: "flex",
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "24px",
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: {
        justifyContent: "flex-end",
        padding: "8px 24px",
        gap: "8px",
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      PopperProps: { container },
      slotProps: {
        tooltip: {
          sx: {
            backgroundColor: "var(--mui-palette-grey-500)",
          },
        },
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        marginTop: 0,
        // Uncomment to make helper text take no space when not present
        // height: 0,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        "&:not(.MuiDivider-vertical)": {
          width: "100%",
          marginBlock: "0.5rem",
        },
      },
    },
  },
  MuiDrawer: {
    defaultProps: {
      slotProps: {
        root: {
          sx: {
            pointerEvents: "none",
          },
        },
        paper: {
          elevation: 3,
          sx: {
            position: "absolute",
            pointerEvents: "auto",
          },
        },
        backdrop: {
          sx: {
            position: "absolute",
          },
        },
      },
      ModalProps: {
        style: { position: "absolute" },
        hideBackdrop: true,
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true,
        disableScrollLock: true,
      },
    },
  },
  MuiChip: {
    defaultProps: {
      variant: "outlined",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: "1rem",
        lineHeight: "1.5rem",
        fontWeight: 600,
        borderRadius: "4px",
        "&.MuiChip-outlinedDefault, &.MuiChip-outlinedSecondary": {
          color: theme.palette.grey[600],
          backgroundColor: theme.palette.grey[200],
          borderColor: theme.palette.grey[300],
        },
        "&.MuiChip-outlinedPrimary, &.MuiChip-outlinedInfo": {
          color: theme.palette.info[700],
          backgroundColor: theme.palette.info[50],
          borderColor: theme.palette.info[200],
        },
        "&.MuiChip-outlinedError": {
          color: theme.palette.error[700],
          backgroundColor: theme.palette.error[50],
          borderColor: theme.palette.error[200],
        },
        "&.MuiChip-outlinedSuccess": {
          color: theme.palette.success[700],
          backgroundColor: theme.palette.success[50],
          borderColor: theme.palette.success[200],
        },
        "&.MuiChip-outlinedWarning": {
          color: theme.palette.warning[700],
          backgroundColor: theme.palette.warning[50],
          borderColor: theme.palette.warning[200],
        },
        "&.MuiChip-clickable:active": {
          boxShadow: "none",
        },
      }),
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        gap: "8px",
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme, ownerState }) => {
        const color = ownerState.color ?? "standard";
        const selected = ownerState.selected ?? false;

        const selectedStyles = {
          standard: {
            backgroundColor: `${theme.palette.grey[900]} !important`,
          },
          secondary: {
            backgroundColor: `${theme.palette.grey[900]} !important`,
          },
          primary: {
            backgroundColor: `${theme.palette.info[500]} !important`,
          },
          success: {
            backgroundColor: `${theme.palette.success[500]} !important`,
          },
          error: {
            backgroundColor: `${theme.palette.error[500]} !important`,
          },
          info: {
            backgroundColor: `${theme.palette.info[500]} !important`,
          },
          warning: {
            backgroundColor: `${theme.palette.warning[500]} !important`,
          },
        } as const;

        return {
          height: "32px",
          borderRadius: "16px !important",
          border: `1px solid ${theme.palette.grey[300]} !important`,
          color: theme.palette.mode === "light" ? theme.palette.common.black : theme.palette.common.white,
          textTransform: "none",
          fontWeight: 400,
          transition: "all 0.2s ease-in-out",

          // --- Selected state ---
          ...(selected && {
            fontWeight: 500,
            color: `${theme.palette.mode === "light" ? theme.palette.common.white : theme.palette.common.black} !important`,
            ...selectedStyles[color],
          }),
        };
      },
    },
  },
};
