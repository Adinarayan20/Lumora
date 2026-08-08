import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme, useViewport, InteractiveTouchTargetMinimum } from '@lumora/theme';
import { Icon } from '../icon/Icon';
import type { IconButtonProps } from './Button.types';
import { resolveButtonStyles } from './Button.styles';
import { InteractiveAction } from './InteractiveAction';

export const IconButton: React.FC<IconButtonProps> = memo(({
  icon,
  accessibilityLabel,
  accessibilityHint,
  variant = 'ghost',
  size,
  shape = 'rounded',
  onPress,
  loading = false,
  disabled = false,
  testID,
  style,
}) => {
  const { colors } = useTheme();
  const viewport = useViewport();

  // Development Quality Gate: IconButton MUST provide an explicit non-empty accessibilityLabel
  if (__DEV__ && (!accessibilityLabel || !accessibilityLabel.trim())) {
    throw new Error(
      `[Lumora IconButton Primitive]: IconButton for icon '${icon}' must provide a valid non-empty 'accessibilityLabel' for screen reader compliance.`,
    );
  }

  // Development Quality Gate: IconButton MUST provide a valid onPress handler
  if (__DEV__ && typeof onPress !== 'function') {
    throw new Error(
      `[Lumora IconButton Primitive]: IconButton for icon '${icon}' must provide a valid 'onPress' callback.`,
    );
  }

  // Resolve Styles from Theme Tokens
  const {
    containerStyle,
    iconColorToken,
    spinnerColor,
    focusRingColor,
    hoverBackgroundColor,
    touchTargetDimension,
    resolvedIconSize,
    resolvedHeight,
  } = resolveButtonStyles({
    variant,
    size,
    shape,
    themeColors: colors,
    sizeClass: viewport.sizeClass,
    isTouchMode: viewport.touchMode,
    disabled,
  });

  const squareDimension = resolvedHeight;

  return (
    <InteractiveAction
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      focusRingColor={focusRingColor}
      hoverBackgroundColor={hoverBackgroundColor}
      minInteractiveWidth={touchTargetDimension}
      minInteractiveHeight={touchTargetDimension}
      innerStyle={[
        containerStyle,
        {
          width: squareDimension,
          height: squareDimension,
          paddingHorizontal: 0,
        },
        style,
      ]}
    >
      {() => (
        <View style={styles.squareContainer}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={spinnerColor}
              testID={`${testID || 'icon-button'}-spinner`}
            />
          ) : (
            <Icon name={icon} size={resolvedIconSize} color={iconColorToken} />
          )}
        </View>
      )}
    </InteractiveAction>
  );
});

IconButton.displayName = 'IconButton';

const styles = StyleSheet.create({
  squareContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
