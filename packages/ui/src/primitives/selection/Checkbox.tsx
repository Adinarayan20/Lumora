import React, { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import {
  useTheme,
  IndicatorDimensions,
  InteractiveTouchTargetMinimum,
  RadiusScale,
} from '@lumora/theme';
import { Icon } from '../icon/Icon';
import { FieldControl } from '../field/FieldControl';
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

  const effectiveAccessibilityLabel = accessibilityLabel || label || 'Checkbox';

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
          accessibilityRole="checkbox"
          accessibilityLabel={effectiveAccessibilityLabel}
          accessibilityState={{
            checked,
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
        </Pressable>
      </View>
    </FieldControl>
  );
});

Checkbox.displayName = 'Checkbox';

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
  box: {
    borderWidth: 1,
    alignItems: 'center',
    justify: 'center',
  },
});
