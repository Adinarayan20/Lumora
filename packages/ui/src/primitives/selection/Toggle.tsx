import React, { memo } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import {
  useTheme,
  ToggleDimensions,
  InteractiveTouchTargetMinimum,
  RadiusScale,
  SpacingScale,
} from '@lumora/theme';
import { Text } from '../typography/Text';
import { Caption } from '../typography/Caption';
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (Platform.OS === 'web' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      handlePress();
    }
  };

  const webKeyboardProps: { onKeyDown?: (e: React.KeyboardEvent) => void } =
    Platform.OS === 'web' ? { onKeyDown: handleKeyDown } : {};

  const effectiveAccessibilityLabel = accessibilityLabel || label || 'Toggle switch';

  return (
    <View style={styles.touchContainer} testID={testID ? `${testID}-toggle-container` : undefined}>
      <Pressable
        onPress={handlePress}
        {...webKeyboardProps}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityLabel={effectiveAccessibilityLabel}
        accessibilityState={{
          checked: value,
          disabled,
        }}
        testID={testID}
        style={[
          styles.pressableRow,
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
          {/* Note: translateX offset values (2px left, 4px right inset) are physical track geometry padding insets */}
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

        {label ? (
          <View style={styles.textBlock}>
            <Text color={disabled ? 'textMuted' : 'textPrimary'}>
              {label}
            </Text>
            {helperText ? (
              <Caption color="textMuted">
                {helperText}
              </Caption>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </View>
  );
});

Toggle.displayName = 'Toggle';

const styles = StyleSheet.create({
  touchContainer: {
    minHeight: InteractiveTouchTargetMinimum,
    justifyContent: 'center',
    paddingVertical: SpacingScale.xs,
  },
  pressableRow: {
    minHeight: InteractiveTouchTargetMinimum,
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    borderWidth: 1,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
  },
  textBlock: {
    marginLeft: SpacingScale.xs,
    flexDirection: 'column',
    flex: 1,
  },
});
