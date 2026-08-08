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

      if (Platform.OS === 'web') {
        const handleReposition = () => {
          updatePosition();
        };
        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);
        return () => {
          window.removeEventListener('resize', handleReposition);
          window.removeEventListener('scroll', handleReposition, true);
        };
      }
    }
  }, [visible, updatePosition]);

  if (!visible) return null;

  const windowDim = Dimensions.get('window');
  const windowHeight = windowDim.height || 800;

  // Collision detection: check space below vs space above
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
            left: rect.x,
            width: Math.max(rect.width, 200),
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
