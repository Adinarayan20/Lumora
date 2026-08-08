import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme, useViewport } from '@lumora/theme';
import { ButtonText } from '../typography/ButtonText';
import { Icon } from '../icon/Icon';
import type { ButtonProps } from './Button.types';
import { resolveButtonStyles } from './Button.styles';
import { InteractiveAction } from './InteractiveAction';

export const Button: React.FC<ButtonProps> = memo(({
  label,
  variant = 'primary',
  size,
  shape = 'rounded',
  leftIcon,
  rightIcon,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}) => {
  const { colors } = useTheme();
  const viewport = useViewport();

  // Development Quality Gate: Button MUST provide a valid onPress handler
  if (__DEV__ && typeof onPress !== 'function') {
    throw new Error(
      `[Lumora Button Primitive]: Button for '${label}' must provide a valid 'onPress' callback.`,
    );
  }

  // Resolve Styles from Theme Tokens
  const {
    containerStyle,
    textColorToken,
    iconColorToken,
    spinnerColor,
    focusRingColor,
    hoverBackgroundColor,
    touchTargetDimension,
    resolvedIconGap,
    resolvedIconSize,
  } = resolveButtonStyles({
    variant,
    size,
    shape,
    themeColors: colors,
    sizeClass: viewport.sizeClass,
    isTouchMode: viewport.touchMode,
    disabled,
  });

  return (
    <InteractiveAction
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      fullWidth={fullWidth}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      focusRingColor={focusRingColor}
      hoverBackgroundColor={hoverBackgroundColor}
      minInteractiveHeight={touchTargetDimension}
      innerStyle={[containerStyle, style]}
    >
      {() => (
        <View style={[styles.contentContainer, fullWidth && styles.fullWidth]}>
          {/* Main Visual Content (Hidden when loading to preserve width & layout geometry) */}
          <View style={[styles.labelRow, loading && styles.hiddenContent]}>
            {leftIcon && (
              <View style={{ marginRight: resolvedIconGap }}>
                <Icon name={leftIcon} size={resolvedIconSize} color={iconColorToken} />
              </View>
            )}

            <ButtonText color={textColorToken} numberOfLines={1}>
              {label}
            </ButtonText>

            {rightIcon && (
              <View style={{ marginLeft: resolvedIconGap }}>
                <Icon name={rightIcon} size={resolvedIconSize} color={iconColorToken} />
              </View>
            )}
          </View>

          {/* Centered Spinner during Loading */}
          {loading && (
            <View style={styles.spinnerOverlay}>
              <ActivityIndicator
                size="small"
                color={spinnerColor}
                testID={`${testID || 'button'}-spinner`}
              />
            </View>
          )}
        </View>
      )}
    </InteractiveAction>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenContent: {
    opacity: 0,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
