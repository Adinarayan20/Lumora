import React, { memo } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useTheme } from '@lumora/theme';
import type { CardProps } from './Card.types';
import { resolveCardStyles } from './Card.styles';

export const Card: React.FC<CardProps> = memo(({
  variant = 'outlined',
  padding = 'md',
  selected = false,
  disabled = false,
  onPress,
  children,
  testID,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();

  const isInteractive = Boolean(onPress) || variant === 'interactive';

  const { cardStyle } = resolveCardStyles({
    variant,
    padding,
    selected,
    disabled,
    colors,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (Platform.OS === 'web' && isInteractive && !disabled && onPress && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      onPress();
    }
  };

  const webKeyboardProps: { onKeyDown?: (e: React.KeyboardEvent) => void } =
    Platform.OS === 'web' && isInteractive ? { onKeyDown: handleKeyDown } : {};

  if (isInteractive) {
    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        {...webKeyboardProps}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{
          selected,
          disabled,
        }}
        testID={testID}
        style={cardStyle}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={cardStyle}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </View>
  );
});

Card.displayName = 'Card';
