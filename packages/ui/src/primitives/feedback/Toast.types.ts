import type React from 'react';

export type ToastVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastAction {
  readonly label: string;
  readonly onPress: () => void;
}

export interface ToastOptions {
  readonly id?: string;
  readonly title?: string;
  readonly message: string;
  readonly variant?: ToastVariant;
  readonly durationMs?: number;
  readonly action?: ToastAction;
}

export interface ToastItem extends ToastOptions {
  readonly id: string;
}

export interface ToastContextValue {
  readonly showToast: (options: ToastOptions) => string;
  readonly hideToast: (id: string) => void;
}

export interface ToastProviderProps {
  readonly children: React.ReactNode;
}
