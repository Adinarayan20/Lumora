import type { FieldSchema, FieldType } from "@lumora/shared";

export interface FieldControlAdapterProps<TValue = unknown> {
  readonly value: TValue;
  readonly onChange: (value: TValue) => void;
  readonly label: string;
  readonly helperText?: string;
  readonly errorText?: string;
  readonly disabled?: boolean;
  readonly schema: FieldSchema;
  readonly testID?: string;
}

export type FieldControlComponent = React.ComponentType<
  FieldControlAdapterProps<unknown>
>;

export interface DynamicFormProps {
  readonly fields: readonly FieldSchema[];
  readonly initialValues?: Record<string, unknown>;
  readonly onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  readonly onCancel?: () => void;
  readonly onReset?: () => void;
  readonly submitLabel?: string;
  readonly cancelLabel?: string;
  readonly resetLabel?: string;
  readonly showResetButton?: boolean;
  readonly disabled?: boolean;
  readonly isLoading?: boolean;
  readonly registry?: IFieldRegistry;
  readonly testID?: string;
}

export interface DynamicFormState {
  readonly values: Record<string, unknown>;
  readonly errors: Record<string, string>;
  readonly touched: Record<string, boolean>;
  readonly isDirty: boolean;
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
}

export interface IFieldRegistry {
  get(fieldType: FieldType): FieldControlComponent | undefined;
  has(fieldType: FieldType): boolean;
  register(fieldType: FieldType, component: FieldControlComponent): void;
  createChild(): IFieldRegistry;
}
