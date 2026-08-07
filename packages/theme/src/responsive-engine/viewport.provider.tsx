import React, { createContext, useContext, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type WindowSizeClass = 'Compact' | 'Medium' | 'Expanded' | 'Large' | 'Ultra';
export type NavigationMode = 'bottom-bar' | 'navigation-rail' | 'sidebar';
export type DeviceType = 'phone' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface ViewportState {
  readonly width: number;
  readonly height: number;
  readonly sizeClass: WindowSizeClass;
  readonly isCompact: boolean;
  readonly isMedium: boolean;
  readonly isExpanded: boolean;
  readonly isLarge: boolean;
  readonly isUltra: boolean;
  readonly isLandscape: boolean;
  readonly isPortrait: boolean;
  readonly orientation: Orientation;
  readonly deviceType: DeviceType;
  readonly touchMode: boolean;
  readonly pointerMode: boolean;
  readonly columns: number;
  readonly gutter: number;
  readonly pagePadding: number;
  readonly maxContentWidth: number;
  readonly cardWidth: number;
  readonly dialogWidth: number;
  readonly fabOffset: number;
  readonly sheetWidth: number;
  readonly contentWidth: number;
  readonly spacing: {
    readonly small: number;
    readonly medium: number;
    readonly large: number;
  };
  readonly navigationMode: NavigationMode;
}

const ViewportContext = createContext<ViewportState | undefined>(undefined);

export interface ViewportProviderProps {
  readonly children: React.ReactNode;
}

export const ViewportProvider: React.FC<ViewportProviderProps> = ({ children }) => {
  const { width, height } = useWindowDimensions();

  const viewportState = useMemo<ViewportState>(() => {
    let sizeClass: WindowSizeClass = 'Compact';
    let columns = 4;
    let gutter = 16;
    let pagePadding = 16;
    let maxContentWidth = 600;
    let cardWidth = width - 32;
    let dialogWidth = Math.min(width - 32, 480);
    let sheetWidth = width;
    let fabOffset = 16;
    let navigationMode: NavigationMode = 'bottom-bar';
    let deviceType: DeviceType = 'phone';

    if (width >= 1200) {
      deviceType = 'desktop';
    } else if (width >= 600) {
      deviceType = 'tablet';
    }

    if (width >= 1600) {
      sizeClass = 'Ultra';
      columns = 12;
      gutter = 40;
      pagePadding = 64;
      maxContentWidth = 800;
      cardWidth = 380;
      dialogWidth = 560;
      sheetWidth = 640;
      fabOffset = 32;
      navigationMode = 'sidebar';
    } else if (width >= 1200) {
      sizeClass = 'Large';
      columns = 12;
      gutter = 32;
      pagePadding = 40;
      maxContentWidth = 720;
      cardWidth = 340;
      dialogWidth = 520;
      sheetWidth = 580;
      fabOffset = 24;
      navigationMode = 'sidebar';
    } else if (width >= 840) {
      sizeClass = 'Expanded';
      columns = 12;
      gutter = 24;
      pagePadding = 32;
      maxContentWidth = 680;
      cardWidth = 320;
      dialogWidth = 480;
      sheetWidth = 520;
      fabOffset = 24;
      navigationMode = 'sidebar';
    } else if (width >= 600) {
      sizeClass = 'Medium';
      columns = 8;
      gutter = 20;
      pagePadding = 24;
      maxContentWidth = 600;
      cardWidth = (width - 68) / 2;
      dialogWidth = 460;
      sheetWidth = 480;
      fabOffset = 20;
      navigationMode = 'navigation-rail';
    }

    const isLandscape = width > height;

    return {
      width,
      height,
      sizeClass,
      isCompact: sizeClass === 'Compact',
      isMedium: sizeClass === 'Medium',
      isExpanded: sizeClass === 'Expanded',
      isLarge: sizeClass === 'Large',
      isUltra: sizeClass === 'Ultra',
      isLandscape,
      isPortrait: !isLandscape,
      orientation: isLandscape ? 'landscape' : 'portrait',
      deviceType,
      touchMode: deviceType !== 'desktop',
      pointerMode: deviceType === 'desktop',
      columns,
      gutter,
      pagePadding,
      maxContentWidth,
      cardWidth,
      dialogWidth,
      fabOffset,
      sheetWidth,
      contentWidth: Math.min(width - pagePadding * 2, maxContentWidth),
      spacing: {
        small: gutter / 2,
        medium: gutter,
        large: gutter * 1.5,
      },
      navigationMode,
    };
  }, [width, height]);

  return <ViewportContext.Provider value={viewportState}>{children}</ViewportContext.Provider>;
};

export const useViewport = (): ViewportState => {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within a Lumora ViewportProvider');
  }
  return context;
};
