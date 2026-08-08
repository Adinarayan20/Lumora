import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@lumora/theme';
import { Icon } from '../icon/Icon';
import { Text } from '../typography/Text';
import type { BadgeProps } from './Badge.types';
import { resolveBadgeStyles } from './Badge.styles';

export const Badge: React.FC<BadgeProps> = memo(({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  testID,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();

  const { badgeContainerStyle, textStyle, iconGap } = resolveBadgeStyles({
    variant,
    size,
    colors,
  });

  const labelText = typeof children === 'string' ? children : String(children);
  const effectiveAccessibilityLabel = accessibilityLabel || labelText;

  return (
    <View
      style={badgeContainerStyle}
      accessibilityRole="text"
      accessibilityLabel={effectiveAccessibilityLabel}
      testID={testID}
    >
      {icon ? (
        <View style={{ marginRight: iconGap }}>
          <Icon name={icon} size={size === 'lg' ? 'sm' : 'xs'} />
        </View>
      ) : null}

      <Text style={textStyle}>{children}</Text>
    </View>
  );
});

Badge.displayName = 'Badge';
