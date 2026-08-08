import React, { memo } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import {
  useTheme,
  IndicatorDimensions,
  InteractiveTouchTargetMinimum,
  RadiusScale,
  SpacingScale,
} from '@lumora/theme';
import { Icon } from '../icon/Icon';
import { Text } from '../typography/Text';
import { Caption } from '../typography/Caption';
import type { CheckboxProps } from './Selection.types';

export const Checkbox: React.FC<CheckboxProps> = memo(({
  checked,
  onChange,
  label,
  helperText,
  disabled = false,
  size = 'md',
  accessibilityLabel,
  testID,
}) => {
  const { colors } = useTheme();

  const sizePx = IndicatorDimensions.checkbox || 20;
  const opacity = disabled ? colors.disabledOpacity : 1.0;

  const boxBackgroundColor = checked ? colors.primary : colors.surface;
  const boxBorderColor = checked ? colors.primary : colors.border;

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
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

  const effectiveAccessibilityLabel = accessibilityLabel || label || 'Checkbox';

  return (
    <View style={styles.touchContainer} testID={testID ? `${testID}-checkbox-container` : undefined}>
      <Pressable
        onPress={handlePress}
        {...webKeyboardProps}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityLabel={effectiveAccessibilityLabel}
        accessibilityState={{
          checked,
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
            styles.box,
            {
              width: sizePx,
              height: sizePx,
              borderRadius: RadiusScale.md,
              backgroundColor: boxBackgroundColor,
              borderColor: boxBorderColor,
            },
          ]}
        >
          {checked && (
            <Icon name="action.check" size="sm" color="icon.primary" />
          )}
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

Checkbox.displayName = 'Checkbox';

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
  box: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    marginLeft: SpacingScale.xs,
    flexDirection: 'column',
    flex: 1,
  },
});
