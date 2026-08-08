import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@lumora/theme';
import { Text } from '../../../primitives/typography/Text';
import { Card } from '../../../primitives/card/Card';
import type { BlockAdapterProps } from '../BlockRegistry.types';

export const UnresolvedBlockAdapter: React.FC<BlockAdapterProps> = ({
  blockKey,
  testID = 'unresolved-block-adapter',
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation="none"
      padding="m"
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.borderSubtle,
        },
      ]}
    >
      <View style={styles.container} accessibilityRole="summary">
        <Text variant="caption" color="textMuted">
          Capability Block [{blockKey}] is deferred in Batch 5.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginVertical: 4,
  },
  container: {
    paddingVertical: 4,
  },
});
