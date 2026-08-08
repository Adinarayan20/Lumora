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
import { Icon } from '../icon/Icon';
import type { IconButtonProps } from './Button.types';
import { resolveButtonStyles } from './Button.styles';

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
  const { mode, colors } = useTheme();
  const viewport = useViewport();

  // Development Quality Gate: IconButton MUST provide an explicit accessibilityLabel
  if (__DEV__ && !accessibilityLabel) {
    throw new Error(
      `[Lumora IconButton Primitive]: IconButton for icon '${icon}' must provide an explicit 'accessibilityLabel' for screen reader compliance.`,
    );
  }

  // Development Quality Gate: IconButton MUST provide an onPress handler
  if (__DEV__ && typeof onPress !== 'function') {
    throw new Error(
      `[Lumora IconButton Primitive]: IconButton for icon '${icon}' must provide a valid 'onPress' callback.`,
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
    iconColorToken,
    spinnerColor,
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
  const squareDimension = resolvedHeight;
  const targetDimension = Math.max(touchTargetDimension, squareDimension);

  return (
    <View
      style={[
        styles.outerWrapper,
        {
          width: targetDimension,
          height: targetDimension,
        },
      ]}
    >
      <Pressable
        onPress={isInteractive ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isInteractive}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
        testID={testID}
        style={[
          styles.touchable,
          {
            width: targetDimension,
            height: targetDimension,
          },
        ]}
      >
        <Animated.View
          style={[
            containerStyle,
            {
              width: squareDimension,
              height: squareDimension,
              paddingHorizontal: 0,
              opacity: containerStyle.opacity * pressedOpacity,
              transform: transformStyle,
            },
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={spinnerColor} testID={`${testID || 'icon-button'}-spinner`} />
          ) : (
            <Icon name={icon} size={resolvedIconSize} color={iconColorToken} />
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
});

IconButton.displayName = 'IconButton';

const styles = StyleSheet.create({
  outerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
