import React, { memo } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import {
  useTheme,
  IndicatorDimensions,
  InteractiveTouchTargetMinimum,
  RadiusScale,
  SpacingScale,
} from '@lumora/theme';
import { Text } from '../typography/Text';
import type { RadioProps } from './Selection.types';

export interface ExtendedRadioProps<T = string> extends RadioProps<T> {
  readonly onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const Radio: React.FC<ExtendedRadioProps> = memo(({
  selected,
  onSelect,
  label,
  description,
  disabled = false,
  testID,
  onKeyDown,
}) => {
  const { colors } = useTheme();

  const outerPx = IndicatorDimensions.radio || 20;
  const innerDotPx = IndicatorDimensions.radioDot || 10;
  const opacity = disabled ? colors.disabledOpacity : 1.0;

  const outerBorderColor = selected ? colors.primary : colors.border;
  const outerBgColor = selected ? colors.surface : colors.surface;
  const dotColor = selected ? colors.primary : 'transparent';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e);
    } else if (Platform.OS === 'web' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      if (!disabled) onSelect();
    }
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onSelect}
      onKeyDown={Platform.OS === 'web' ? (handleKeyDown as any) : undefined}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{
        selected,
        disabled,
      }}
      testID={testID}
      style={[
        styles.container,
        { opacity },
      ]}
    >
      <View
        style={[
          styles.outerCircle,
          {
            width: outerPx,
            height: outerPx,
            borderRadius: RadiusScale.full,
            borderColor: outerBorderColor,
            backgroundColor: outerBgColor,
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.innerDot,
              {
                width: innerDotPx,
                height: innerDotPx,
                borderRadius: RadiusScale.full,
                backgroundColor: dotColor,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.textBlock}>
        <Text color={disabled ? 'textMuted' : 'textPrimary'}>
          {label}
        </Text>
        {description ? (
          <Text role="Caption" color="textMuted">
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
});

Radio.displayName = 'Radio';

const styles = StyleSheet.create({
  container: {
    minHeight: InteractiveTouchTargetMinimum,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SpacingScale.xs,
  },
  outerCircle: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {},
  textBlock: {
    marginLeft: SpacingScale.xs,
    flexDirection: 'column',
  },
});
