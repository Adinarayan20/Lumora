import type { ReactNode } from 'react';

export interface OverlayAnchorRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface OverlayAnchor {
  readonly measure: () => Promise<OverlayAnchorRect>;
}

export interface OverlayProps {
  readonly visible: boolean;
  readonly onRequestClose: () => void;
  readonly children: ReactNode;
  readonly testID?: string;
}

export interface PopoverProps {
  readonly visible: boolean;
  readonly onRequestClose: () => void;
  readonly anchor: OverlayAnchor | OverlayAnchorRect;
  readonly children: ReactNode;
  readonly placement?: 'bottom-start' | 'top-start';
  readonly testID?: string;
}

export interface BottomSheetProps {
  readonly visible: boolean;
  readonly onRequestClose: () => void;
  readonly children: ReactNode;
  readonly title?: string;
  readonly testID?: string;
}
