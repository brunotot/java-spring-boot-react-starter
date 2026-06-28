import { RgoInputToggleButtonGroup, RgoLabelBox } from "@rgo/front-ui";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

type ToggleButtonGroupSlotProps = {
  toggleButtonGroup?: {
    sx?: object;
  };
};

export type FormToggleButtonFieldProps<TFieldValues extends FieldValues, TValue extends {}> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: TValue[];
  renderKey: (option: TValue) => string;
  renderOption: (option: TValue) => string;
  disableClearable?: boolean;
  rgoSlotProps?: ToggleButtonGroupSlotProps;
};

export function FormToggleButtonField<TFieldValues extends FieldValues, TValue extends {}>({
  name,
  control,
  label,
  options,
  renderKey,
  renderOption,
  disableClearable = true,
  rgoSlotProps,
}: FormToggleButtonFieldProps<TFieldValues, TValue>) {
  return (
    <RgoLabelBox label={label}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RgoInputToggleButtonGroup<TValue>
            {...field}
            disableClearable={disableClearable}
            options={options}
            renderKey={renderKey}
            renderOption={renderOption}
            rgoSlotProps={rgoSlotProps}
          />
        )}
      />
    </RgoLabelBox>
  );
}