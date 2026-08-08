import type React from 'react';
import type { ButtonVariant } from '../button/Button.types';

export interface DialogAction {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly loading?: boolean;
}

export interface ModalProps {
  readonly visible: boolean;
  readonly onRequestClose: () => void;
  readonly title?: string;
  readonly children: React.ReactNode;
  readonly testID?: string;
}

export interface DialogProps {
  readonly visible: boolean;
  readonly onRequestClose: () => void;
  readonly title: string;
  readonly description?: string;
  readonly primaryAction: DialogAction;
  readonly secondaryAction?: DialogAction;
  readonly testID?: string;
}
