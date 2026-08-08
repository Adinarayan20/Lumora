import React, { memo, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import {
  useTheme,
  RadiusScale,
  SelectionMenuMaxHeight,
} from '@lumora/theme';
import { Overlay } from './Overlay';
import type { PopoverProps, OverlayAnchorRect } from './Overlay.types';

export const Popover: React.FC<PopoverProps> = memo(({
  visible,
  onRequestClose,
  anchor,
  children,
  placement = 'bottom-start',
  testID,
}) => {
  const { colors } = useTheme();
  const [rect, setRect] = useState<OverlayAnchorRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [windowDim, setWindowDim] = useState(() => Dimensions.get('window'));

  const updatePosition = useCallback(async () => {
    if ('measure' in anchor) {
      const measured = await anchor.measure();
      setRect(measured);
    } else {
      setRect(anchor);
    }
  }, [anchor]);

  useEffect(() => {
    if (visible) {
      updatePosition();

      const subscription = Dimensions.addEventListener('change', ({ window }) => {
        setWindowDim(window);
        updatePosition();
      });

      if (Platform.OS === 'web') {
        const handleReposition = () => {
          updatePosition();
        };
        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);
        return () => {
          subscription?.remove();
          window.removeEventListener('resize', handleReposition);
          window.removeEventListener('scroll', handleReposition, true);
        };
      }

      return () => {
        subscription?.remove();
      };
    }
  }, [visible, updatePosition]);

  if (!visible) return null;

  const windowWidth = windowDim.width || 1024;
  const windowHeight = windowDim.height || 800;

  const popoverWidth = Math.max(rect.width, 200);

  // Horizontal collision prevention (clamps popover within screen edges)
  const popoverX = Math.max(10, Math.min(rect.x, windowWidth - popoverWidth - 10));

  // Vertical collision detection: opens above if near bottom of viewport
  const spaceBelow = windowHeight - (rect.y + rect.height);
  const opensAbove = placement === 'top-start' || (spaceBelow < 200 && rect.y > spaceBelow);

  const popoverY = opensAbove
    ? Math.max(10, rect.y - SelectionMenuMaxHeight - 4)
    : rect.y + rect.height + 4;

  const maxAvailableHeight = opensAbove
    ? Math.min(SelectionMenuMaxHeight, rect.y - 20)
    : Math.min(SelectionMenuMaxHeight, windowHeight - popoverY - 20);

  return (
    <Overlay visible={visible} onRequestClose={onRequestClose} testID={testID}>
      <View
        style={[
          styles.popoverCard,
          {
            top: popoverY,
            left: popoverX,
            width: popoverWidth,
            maxHeight: Math.max(100, maxAvailableHeight),
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        {children}
      </View>
    </Overlay>
  );
});

Popover.displayName = 'Popover';

const styles = StyleSheet.create({
  popoverCard: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: RadiusScale.md,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
