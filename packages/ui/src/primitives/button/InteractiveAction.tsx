import React, { memo, useState, useEffect } from 'react';
import {
  Pressable,
  AccessibilityInfo,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  MotionEngine,
  InteractivePressedOpacity,
  InteractiveTouchTargetMinimum,
} from '@lumora/theme';

export interface InteractiveActionProps {
  readonly children: React.ReactNode | ((state: { isHovered: boolean; isFocused: boolean; isPressed: boolean }) => React.ReactNode);
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly accessibilityLabel: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly innerStyle?: StyleProp<ViewStyle>;
  readonly focusRingColor?: string;
  readonly hoverBackgroundColor?: string;
  readonly minInteractiveWidth?: number;
  readonly minInteractiveHeight?: number;
}

export const InteractiveAction: React.FC<InteractiveActionProps> = memo(({
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  containerStyle,
  innerStyle,
  focusRingColor,
  hoverBackgroundColor,
  minInteractiveWidth,
  minInteractiveHeight = InteractiveTouchTargetMinimum,
}) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Reduced Motion Detection with Clean Unmount Cleanup
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

  const isInteractive = !disabled && !loading;

  // Motion Configuration from Theme MotionEngine
  const pressMotionConfig = MotionEngine.buttonPress();
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const [pressedOpacity, setPressedOpacity] = useState(1);

  const handlePressIn = () => {
    if (!isInteractive) return;
    setIsPressed(true);
    if (reduceMotion) {
      setPressedOpacity(InteractivePressedOpacity);
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
    setIsPressed(false);
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

  const handleFocus = () => {
    if (isInteractive) setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleHoverIn = () => {
    if (isInteractive) setIsHovered(true);
  };

  const handleHoverOut = () => {
    setIsHovered(false);
  };

  const transformStyle = isInteractive && !reduceMotion ? [{ scale: scaleAnim }] : [];
  
  const focusStyle: ViewStyle | null = isFocused && focusRingColor
    ? {
        borderWidth: 2,
        borderColor: focusRingColor,
      }
    : null;

  const hoverStyle: ViewStyle | null = isHovered && !isPressed && hoverBackgroundColor
    ? {
        backgroundColor: hoverBackgroundColor,
      }
    : null;

  const targetMinHeight = Math.max(minInteractiveHeight, InteractiveTouchTargetMinimum);
  const targetMinWidth = minInteractiveWidth ? Math.max(minInteractiveWidth, InteractiveTouchTargetMinimum) : undefined;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
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
        styles.touchableArea,
        fullWidth && styles.fullWidth,
        {
          minHeight: targetMinHeight,
          minWidth: targetMinWidth,
        },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          innerStyle,
          hoverStyle,
          focusStyle,
          fullWidth && styles.fullWidth,
          {
            opacity: (innerStyle ? (StyleSheet.flatten(innerStyle)?.opacity ?? 1) : 1) * pressedOpacity,
            transform: transformStyle,
          },
        ]}
      >
        {typeof children === 'function' ? children({ isHovered, isFocused, isPressed }) : children}
      </Animated.View>
    </Pressable>
  );
});

InteractiveAction.displayName = 'InteractiveAction';

const styles = StyleSheet.create({
  touchableArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
