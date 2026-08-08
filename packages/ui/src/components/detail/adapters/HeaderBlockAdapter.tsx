import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@lumora/theme';
import { Text } from '../../../primitives/typography/Text';
import { Card } from '../../../primitives/card/Card';
import { Badge } from '../../../primitives/badge/Badge';
import { Icon } from '../../../primitives/icon/Icon';
import type { BlockAdapterProps } from '../BlockRegistry.types';

export const HeaderBlockAdapter: React.FC<BlockAdapterProps> = ({
  object,
  definition,
  testID = 'header-block-adapter',
}) => {
  const theme = useTheme();

  const titleRaw =
    object.attributes.title ??
    object.attributes.name ??
    object.attributes.label ??
    `${definition.name} (${object.id.slice(0, 6)})`;

  const titleText = String(titleRaw);
  const statusText = object.status ?? (object.attributes.status as string | undefined);

  return (
    <Card
      elevation="subtle"
      padding="l"
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfacePrimary,
          borderColor: theme.colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.headerRow} accessibilityRole="header">
        <View style={styles.titleContainer}>
          <View style={styles.iconTitleRow}>
            {definition.icon ? (
              <View style={styles.iconWrapper}>
                <Icon name={definition.icon} size="m" color="primary" />
              </View>
            ) : null}
            <Text variant="headingM" color="textPrimary" style={styles.titleText}>
              {titleText}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <Badge label={definition.name} variant="neutral" size="s" />
            {statusText ? (
              <Badge label={String(statusText)} variant="accent" size="s" />
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'column',
    gap: 8,
  },
  titleContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  iconWrapper: {
    marginRight: 4,
  },
  titleText: {
    flexShrink: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
});
