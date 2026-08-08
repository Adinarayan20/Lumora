import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, SpacingScale, RadiusScale } from '@lumora/theme';
import { Caption } from '../../../primitives/typography/Caption';
import { Text } from '../../../primitives/typography/Text';
import type { FieldControlAdapterProps } from '../DynamicForm.types';

export const UnresolvedFieldAdapter: React.FC<FieldControlAdapterProps<unknown>> = memo(({
  schema,
  testID,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`Unsupported field control for ${schema.label}`}
    >
      <Text role="Label" color="textSecondary">
        {schema.label} ({schema.type})
      </Text>
      <Caption color="textMuted">
        Field control primitive for '{schema.type}' is currently deferred or unresolved.
      </Caption>
    </View>
  );
});

UnresolvedFieldAdapter.displayName = 'UnresolvedFieldAdapter';

const styles = StyleSheet.create({
  container: {
    padding: SpacingScale.sm,
    borderRadius: RadiusScale.card,
    borderWidth: 1,
    marginVertical: SpacingScale.xs,
  },
});
