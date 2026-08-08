import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  useTheme,
  ToggleDimensions,
  InteractiveTouchTargetMinimum,
  RadiusScale,
} from '@lumora/theme';
import { FieldControl } from '../field/FieldControl';
import type { ToggleProps } from './Selection.types';

export const Toggle: React.FC<ToggleProps> = memo(({
  value,
  onValueChange,
  label,
  helperText,
  disabled = false,
  size = 'md',
  accessibilityLabel,
  testID,
}) => {
  const { colors } = useTheme();

  const dims = ToggleDimensions[size] || ToggleDimensions.md;
  const opacity = disabled ? colors.disabledOpacity : 1.0;

  const trackBackgroundColor = value ? colors.primary : colors.backgroundSecondary;
  const trackBorderColor = value ? colors.primary : colors.border;
  const thumbColor = value ? colors.surface : colors.textMuted;

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const effectiveAccessibilityLabel = accessibilityLabel || label || 'Toggle switch';

  return (
    <FieldControl
      label={label}
      helperText={helperText}
      disabled={disabled}
      testID={testID}
    >
      <View style={styles.touchContainer}>
        <Pressable
          onPress={handlePress}
          disabled={disabled}
          accessibilityRole="switch"
          accessibilityLabel={effectiveAccessibilityLabel}
          accessibilityState={{
            checked: value,
            disabled,
          }}
          testID={testID}
          style={[
            styles.pressableArea,
            { opacity },
          ]}
        >
          <View
            style={[
              styles.track,
              {
                width: dims.width,
                height: dims.height,
                borderRadius: RadiusScale.full,
                backgroundColor: trackBackgroundColor,
                borderColor: trackBorderColor,
              },
            ]}
          >
            <View
              style={[
                styles.thumb,
                {
                  width: dims.thumb,
                  height: dims.thumb,
                  borderRadius: RadiusScale.full,
                  backgroundColor: thumbColor,
                  transform: [{ translateX: value ? dims.width - dims.thumb - 4 : 2 }],
                },
              ]}
            />
          </View>
        </Pressable>
      </View>
    </FieldControl>
  );
});

Toggle.displayName = 'Toggle';

const styles = StyleSheet.create({
  touchContainer: {
    minHeight: InteractiveTouchTargetMinimum,
    justifyContent: 'center',
  },
  pressableArea: {
    minHeight: InteractiveTouchTargetMinimum,
    minWidth: InteractiveTouchTargetMinimum,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  track: {
    borderWidth: 1,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
  },
});
