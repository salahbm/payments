import { ReactNode } from 'react';

import {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormStateReturn,
} from 'react-hook-form';

export interface CustomProps<T extends FieldValues> {
  id?: string;
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  message?: string | ReactNode;
  messageClassName?: string;
  render: (params: {
    field: ControllerRenderProps<T, Path<T>>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<T>;
  }) => ReactNode;
}
