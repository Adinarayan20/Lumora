import React, { forwardRef, memo, useMemo } from 'react';
import { Text as RNText, View, ViewStyle } from 'react-native';
import { useTheme, useViewport } from '@lumora/theme';
import type { TypographyProps } from './Typography.types.js';
import { TypographyStyleComposer } from './resolvers/TypographyStyleComposer.js';
import { DEFAULT_TYPOGRAPHY_ROLE } from './Typography.constants.js';

export const Typography = memo(
  forwardRef<RNText, TypographyProps>((props, ref) => {
    const {
      children,
      role = DEFAULT_TYPOGRAPHY_ROLE,
      color = 'textPrimary',
      emphasis = 'default',
      align = 'auto',
      numberOfLines,
      selectable = false,
      truncate = false,
      italic = false,
      uppercase = false,
      readingWidth = false,
      maxFontSizeMultiplier = 2.0,
      accessibilityHint,
      accessibilityLanguage,
      importantForAccessibility = 'auto',
      writingDirection = 'auto',
      style,
      accessibilityLabel,
      testID,
    } = props;

    const { colors } = useTheme();
    const viewport = useViewport();

    const resolvedTextStyle = useMemo(() => {
      return TypographyStyleComposer.composeStyle({
        role,
        colorToken: color,
        emphasis,
        colors,
        deviceType: viewport.deviceType,
        align,
        italic,
        uppercase,
        writingDirection,
      });
    }, [role, color, emphasis, colors, viewport.deviceType, align, italic, uppercase, writingDirection]);

    const containerStyle = useMemo<ViewStyle | undefined>(() => {
      if (!readingWidth) return undefined;
      return {
        maxWidth: viewport.maxReadingWidth,
        width: '100%',
      };
    }, [readingWidth, viewport.maxReadingWidth]);

    const isHeaderRole =
      role === 'Display XL' ||
      role === 'Display L' ||
      role === 'Hero' ||
      role === 'Headline' ||
      role === 'Title Large';

    const textElement = (
      <RNText
        ref={ref}
        style={[resolvedTextStyle, style]}
        numberOfLines={truncate ? numberOfLines ?? 1 : numberOfLines}
        selectable={selectable}
        allowFontScaling={true}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        accessibilityRole={isHeaderRole ? 'header' : 'text'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityLanguage={accessibilityLanguage}
        importantForAccessibility={importantForAccessibility}
        testID={testID}
      >
        {children}
      </RNText>
    );

    if (readingWidth) {
      return <View style={containerStyle}>{textElement}</View>;
    }

    return textElement;
  }),
);

Typography.displayName = 'Typography';
