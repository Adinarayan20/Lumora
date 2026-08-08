import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@lumora/theme';
import { Text } from '../../../primitives/typography/Text';
import { Card } from '../../../primitives/card/Card';
import type { BlockAdapterProps } from '../BlockRegistry.types';

export const formatPropertyValue = (val: unknown): string => {
  if (val === undefined || val === null) {
    return '—';
  }
  if (typeof val === 'boolean') {
    return val ? 'True' : 'False';
  }
  if (typeof val === 'number') {
    return String(val);
  }
  if (typeof val === 'string') {
    return val.trim() === '' ? '—' : val;
  }
  if (typeof val === 'object') {
    return '[Structured Data]';
  }
  return String(val);
};

export const PropertiesBlockAdapter: React.FC<BlockAdapterProps> = ({
  object,
  schema,
  fields: propFields,
  testID = 'properties-block-adapter',
}) => {
  const theme = useTheme();

  const fields = schema?.fields ?? propFields;
  const attributeKeys = Object.keys(object.attributes);

  const displayProperties: Array<{ key: string; label: string; value: string }> = [];

  if (fields && fields.length > 0) {
    for (const field of fields) {
      // Skip title/name if already displayed in header, unless required
      if (field.key === 'title' || field.key === 'name') continue;
      const rawVal = object.attributes[field.key];
      displayProperties.push({
        key: field.key,
        label: field.label,
        value: formatPropertyValue(rawVal),
      });
    }
  } else {
    for (const key of attributeKeys) {
      if (key === 'title' || key === 'name') continue;
      const rawVal = object.attributes[key];
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      displayProperties.push({
        key,
        label,
        value: formatPropertyValue(rawVal),
      });
    }
  }

  if (displayProperties.length === 0) {
    return (
      <Card
        elevation="none"
        padding="m"
        testID={testID}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: theme.colors.borderSubtle,
          },
        ]}
      >
        <Text variant="caption" color="textMuted">
          No additional properties configured.
        </Text>
      </Card>
    );
  }

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
      <View accessibilityRole="region" accessibilityLabel="Object properties list">
        <Text variant="headingS" color="textPrimary" style={styles.sectionHeader}>
          Properties
        </Text>
        <View style={styles.grid}>
          {displayProperties.map((prop) => (
            <View
              key={prop.key}
              style={[
                styles.propertyItem,
                { borderBottomColor: theme.colors.borderSubtle },
              ]}
            >
              <Text variant="label" color="textSecondary">
                {prop.label}
              </Text>
              <Text variant="body" color="textPrimary" style={styles.propertyValue}>
                {prop.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'column',
    gap: 12,
  },
  propertyItem: {
    flexDirection: 'column',
    gap: 2,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  propertyValue: {
    marginTop: 2,
  },
});
