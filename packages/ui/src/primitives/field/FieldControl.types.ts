import type { ReactNode } from 'react';

export interface FieldControlProps {
  readonly children: ReactNode;
  readonly label?: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly disabled?: boolean;
  readonly testID?: string;
}
