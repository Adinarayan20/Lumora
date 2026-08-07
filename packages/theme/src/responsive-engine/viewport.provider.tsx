import React, { createContext, useContext, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type WindowSizeClass = 'Compact' | 'Medium' | 'Expanded' | 'Large' | 'Ultra';
export type NavigationMode = 'bottom-bar' | 'navigation-rail' | 'sidebar';

export interface ViewportState {
  readonly width: number;
  readonly height: number;
  readonly sizeClass: WindowSizeClass;
  readonly isCompact: boolean;
  readonly isMedium: boolean;
  readonly isExpanded: boolean;
  readonly isLarge: boolean;
  readonly isUltra: boolean;
  readonly columns: number;
  readonly gutter: number;
  readonly pagePadding: number;
  readonly maxContentWidth: number;
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
    let navigationMode: NavigationMode = 'bottom-bar';

    if (width >= 1600) {
      sizeClass = 'Ultra';
      columns = 12;
      gutter = 40;
      pagePadding = 64;
      maxContentWidth = 800;
      navigationMode = 'sidebar';
    } else if (width >= 1200) {
      sizeClass = 'Large';
      columns = 12;
      gutter = 32;
      pagePadding = 40;
      maxContentWidth = 720;
      navigationMode = 'sidebar';
    } else if (width >= 840) {
      sizeClass = 'Expanded';
      columns = 12;
      gutter = 24;
      pagePadding = 32;
      maxContentWidth = 680;
      navigationMode = 'sidebar';
    } else if (width >= 600) {
      sizeClass = 'Medium';
      columns = 8;
      gutter = 20;
      pagePadding = 24;
      maxContentWidth = 600;
      navigationMode = 'navigation-rail';
    }

    return {
      width,
      height,
      sizeClass,
      isCompact: sizeClass === 'Compact',
      isMedium: sizeClass === 'Medium',
      isExpanded: sizeClass === 'Expanded',
      isLarge: sizeClass === 'Large',
      isUltra: sizeClass === 'Ultra',
      columns,
      gutter,
      pagePadding,
      maxContentWidth,
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
