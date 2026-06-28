import "@mui/material/styles";

import { type DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { type DateTimePickerProps } from "@mui/x-date-pickers/DateTimePicker";
import { type TimePickerProps } from "@mui/x-date-pickers/TimePicker";
import { type TODO } from "@rgo/front-ui";

declare module "@mui/material/styles" {
  interface Color {
    25: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
    975: string;
  }

  interface PaletteColor {
    25: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
    975: string;
  }

  interface ComponentsPropsList {
    MuiDateTimePicker: DateTimePickerProps<TODO>;
    MuiDatePicker: DatePickerProps<TODO>;
    MuiTimePicker: TimePickerProps<TODO>;
  }

  interface Components {
    MuiDateTimePicker?: {
      defaultProps?: ComponentsPropsList["MuiDateTimePicker"];
    };
    MuiDatePicker?: {
      defaultProps?: ComponentsPropsList["MuiDatePicker"];
    };
    MuiTimePicker?: {
      defaultProps?: ComponentsPropsList["MuiTimePicker"];
    };
  }
}
