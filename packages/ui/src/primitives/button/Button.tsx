import React, { memo, useState, useEffect } from 'react';
import {
  Pressable,
  View,
  AccessibilityInfo,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme, useViewport, MotionEngine, IconPressedOpacity } from '@lumora/theme';
import { ButtonText } from '../typography/ButtonText';
import { Icon } from '../icon/Icon';
import type { ButtonProps } from './Button.types';
import { resolveButtonStyles } from './Button.styles';

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
  const { mode, colors } = useTheme();
  const viewport = useViewport();

  // Development Quality Gate: Button MUST provide an onPress handler
  if (__DEV__ && typeof onPress !== 'function') {
    throw new Error(
      `[Lumora Button Primitive]: Button for '${label}' must provide a valid 'onPress' callback.`,
    );
  }

  // Reduced Motion Detection
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    return () => {
      isMounted = false;
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  // Motion Configuration from Theme MotionEngine
  const pressMotionConfig = MotionEngine.buttonPress();

  // Animated Scale & Opacity for Press State
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const [pressedOpacity, setPressedOpacity] = useState(1);

  const isInteractive = !disabled && !loading;

  const handlePressIn = () => {
    if (!isInteractive) return;
    if (reduceMotion) {
      setPressedOpacity(IconPressedOpacity);
      return;
    }
    Animated.spring(scaleAnim, {
      toValue: pressMotionConfig.scale,
      damping: pressMotionConfig.springDamping,
      stiffness: pressMotionConfig.springStiffness,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!isInteractive) return;
    if (reduceMotion) {
      setPressedOpacity(1);
      return;
    }
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: pressMotionConfig.springDamping,
      stiffness: pressMotionConfig.springStiffness,
      useNativeDriver: true,
    }).start();
  };

  // Resolve Styles from Theme Tokens
  const {
    containerStyle,
    textColorToken,
    iconColorToken,
    spinnerColor,
    resolvedIconGap,
    resolvedIconSize,
    touchTargetDimension,
    resolvedHeight,
  } = resolveButtonStyles({
    variant,
    size,
    shape,
    themeColors: colors,
    sizeClass: viewport.sizeClass,
    isTouchMode: viewport.touchMode,
    disabled,
    loading,
  });

  const transformStyle = isInteractive && !reduceMotion ? [{ scale: scaleAnim }] : [];

  return (
    <View
      style={[
        styles.outerWrapper,
        fullWidth && styles.fullWidth,
        {
          minHeight: Math.max(touchTargetDimension, resolvedHeight),
        },
      ]}
    >
      <Pressable
        onPress={isInteractive ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isInteractive}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        testID={testID}
        style={[styles.touchable, fullWidth && styles.fullWidth]}
      >
        <Animated.View
          style={[
            containerStyle,
            fullWidth && styles.fullWidth,
            {
              opacity: containerStyle.opacity * pressedOpacity,
              transform: transformStyle,
            },
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={spinnerColor} testID={`${testID || 'button'}-spinner`} />
          ) : (
            <React.Fragment>
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
            </React.Fragment>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
