import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@lumora/theme';
import { Text } from '../../primitives/typography/Text';
import { Card } from '../../primitives/card/Card';
import { Button } from '../../primitives/button/Button';
import { Dialog } from '../../primitives/modal/Dialog';
import { defaultBlockRegistry } from '../detail/BlockRegistry';
import type { DynamicObjectDetailProps } from './DynamicObjectDetail.types';
import { useObjectDetail } from './useObjectDetail';

export const DynamicObjectDetail: React.FC<DynamicObjectDetailProps> = ({
  object,
  definition,
  schema,
  blockRegistry = defaultBlockRegistry,
  blocks = ['header', 'properties'],
  actions,
  onEdit,
  onDelete,
  onArchive,
  onStatusChange,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load object details.',
  testID = 'dynamic-object-detail',
}) => {
  const theme = useTheme();

  const {
    isDeleteDialogOpen,
    closeDeleteDialog,
    handleConfirmDelete,
    openDeleteDialog,
    resolvedActions,
  } = useObjectDetail({
    object,
    definition,
    schema,
    actions,
    onEdit,
    onDelete,
    onArchive,
    onStatusChange,
  });

  // 1. Loading State
  if (isLoading) {
    return (
      <View style={styles.container} testID={`${testID}-loading`}>
        <Card
          elevation="subtle"
          padding="l"
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.borderSubtle,
            },
          ]}
        >
          <Text variant="body" color="textMuted" accessibilityRole="summary">
            Loading object details...
          </Text>
        </Card>
      </View>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <View style={styles.container} testID={`${testID}-error`}>
        <Card
          elevation="none"
          padding="l"
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: theme.colors.borderSubtle,
            },
          ]}
        >
          <Text variant="headingS" color="danger" style={styles.errorTitle}>
            Unable to Display Object
          </Text>
          <Text variant="body" color="textSecondary">
            {errorMessage}
          </Text>
        </Card>
      </View>
    );
  }

  // 3. Empty / Not Found State
  if (!object) {
    return (
      <View style={styles.container} testID={`${testID}-empty`}>
        <Card
          elevation="none"
          padding="l"
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderColor: theme.colors.borderSubtle,
            },
          ]}
        >
          <Text variant="headingS" color="textSecondary">
            Object Not Found
          </Text>
          <Text variant="caption" color="textMuted">
            The requested object does not exist or has been removed.
          </Text>
        </Card>
      </View>
    );
  }

  // 4. Content View
  const objectTitle =
    String(
      object.attributes.title ??
        object.attributes.name ??
        `${definition.name} #${object.id.slice(0, 4)}`,
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      testID={testID}
      accessibilityRole="main"
      accessibilityLabel={`${definition.name} Detail: ${objectTitle}`}
    >
      {/* Detail Blocks Render Pipeline */}
      {blocks.map((blockKey) => {
        const AdapterComponent = blockRegistry.get(blockKey);
        return (
          <AdapterComponent
            key={blockKey}
            blockKey={blockKey}
            object={object}
            definition={definition}
            schema={schema}
            testID={`${testID}-block-${blockKey}`}
          />
        );
      })}

      {/* Object Action Bar */}
      {resolvedActions.length > 0 ? (
        <Card
          elevation="subtle"
          padding="m"
          style={[
            styles.actionsCard,
            {
              backgroundColor: theme.colors.surfacePrimary,
              borderColor: theme.colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.actionsRow} accessibilityRole="toolbar">
            {resolvedActions.map((action) => (
              <Button
                key={action.key}
                label={action.label}
                variant={action.variant ?? 'secondary'}
                size="m"
                disabled={action.disabled}
                isLoading={action.loading}
                onPress={() => {
                  if (action.requiresConfirmation) {
                    openDeleteDialog();
                  } else if (action.onPress) {
                    action.onPress(object);
                  }
                }}
                testID={`${testID}-action-${action.key}`}
              />
            ))}
          </View>
        </Card>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={isDeleteDialogOpen}
        title={`Delete ${definition.name}?`}
        description={`Are you sure you want to delete "${objectTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
        testID={`${testID}-delete-dialog`}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
  },
  errorTitle: {
    marginBottom: 4,
  },
  actionsCard: {
    marginTop: 8,
    borderRadius: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
