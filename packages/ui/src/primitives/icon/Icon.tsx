import React, { memo, useState, useEffect } from 'react';
import {
  Pressable,
  View,
  I18nManager,
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import {
  FontAwesome,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from '@expo/vector-icons';
import { useTheme, useViewport, MotionEngine } from '@lumora/theme';
import type { IconProps } from './Icon.types';
import { getRegisteredIcon } from './Icon.registry';
import { resolveIconStyles } from './Icon.styles';

const VectorFamilies = {
  FontAwesome,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
};

export const Icon: React.FC<IconProps> = memo(({
  name,
  size,
  strokeWeight = 'auto',
  color = 'icon.primary',
  variant = 'default',
  accessibilityLabel,
  accessibilityHint,
  onPress,
  testID,
  style,
  isLoading = false,
  isSelected = false,
  isRTLMirrorable,
}) => {
  const { mode, colors } = useTheme();
  const viewport = useViewport();

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

  // Animated Rotation for Loading State
  const [spinAnim] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (isLoading && !reduceMotion) {
      spinAnim.setValue(0);
      const animation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animation.start();
      return () => animation.stop();
    } else {
      spinAnim.setValue(0);
    }
  }, [isLoading, reduceMotion, spinAnim]);

  // Animated Scale for Press State
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (reduceMotion) return;
    const pressConfig = MotionEngine.press();
    Animated.spring(scaleAnim, {
      toValue: pressConfig.scale,
      damping: pressConfig.springDamping,
      stiffness: pressConfig.springStiffness,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (reduceMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 20,
      stiffness: 250,
      useNativeDriver: true,
    }).start();
  };

  // 1. Resolve Registered Vector Family & Glyph
  const registryEntry = getRegisteredIcon(name);
  const VectorComponent = (VectorFamilies[registryEntry.family] || Feather) as any;

  // 2. Resolve Styles from Theme Tokens
  const {
    resolvedSize,
    resolvedStrokeWidth,
    resolvedColor,
    resolvedOpacity,
    touchTargetDimension,
  } = resolveIconStyles({
    size,
    color,
    strokeWeight,
    themeColors: colors,
    themeMode: mode,
    sizeClass: viewport.sizeClass,
    isTouchMode: viewport.touchMode,
    isSelected,
  });

  // 3. Resolve RTL Mirroring
  const shouldMirror =
    (isRTLMirrorable ?? registryEntry.autoMirror ?? false) && I18nManager.isRTL;

  // 4. Transform Animations
  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const transformStyle: any[] = [];
  if (shouldMirror) {
    transformStyle.push({ scaleX: -1 });
  }
  if (isLoading && !reduceMotion) {
    transformStyle.push({ rotate: spinInterpolate });
  }
  if (onPress && !reduceMotion) {
    transformStyle.push({ scale: scaleAnim });
  }

  // Render Inner Glyph
  const innerGlyph = (
    <Animated.View
      style={[
        styles.glyphContainer,
        {
          width: resolvedSize,
          height: resolvedSize,
          opacity: resolvedOpacity,
          transform: transformStyle,
        },
      ]}
    >
      <VectorComponent
        name={registryEntry.glyph as any}
        size={resolvedSize}
        color={resolvedColor}
      />
    </Animated.View>
  );

  // 5. Interactive Mode (onPress Provided)
  if (onPress) {
    const effectiveLabel = accessibilityLabel || name;
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={effectiveLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
        hitSlop={Math.max(0, (touchTargetDimension - resolvedSize) / 2)}
        style={[
          styles.touchTarget,
          {
            width: Math.max(touchTargetDimension, resolvedSize),
            height: Math.max(touchTargetDimension, resolvedSize),
          },
          style,
        ]}
      >
        {innerGlyph}
      </Pressable>
    );
  }

  // 6. Standalone Informational Mode (accessibilityLabel provided without onPress)
  if (accessibilityLabel) {
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
        style={[styles.standaloneContainer, style]}
      >
        {innerGlyph}
      </View>
    );
  }

  // 7. Decorative Mode (Default: hidden from assistive technology)
  return (
    <View
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      testID={testID}
      style={[styles.decorativeContainer, style]}
    >
      {innerGlyph}
    </View>
  );
});

Icon.displayName = 'Icon';

const styles = StyleSheet.create({
  glyphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchTarget: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  standaloneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorativeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
