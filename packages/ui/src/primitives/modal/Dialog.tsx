import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SpacingScale } from '@lumora/theme';
import { Text } from '../typography/Text';
import { Button } from '../button/Button';
import { Modal } from './Modal';
import type { DialogProps } from './Modal.types';

export const Dialog: React.FC<DialogProps> = memo(({
  visible,
  onRequestClose,
  title,
  description,
  primaryAction,
  secondaryAction,
  testID,
}) => {
  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      title={title}
      testID={testID}
    >
      <View style={styles.dialogBody}>
        {description ? (
          <Text role="Body" color="textSecondary" style={styles.descriptionText}>
            {description}
          </Text>
        ) : null}

        <View style={styles.actionRow}>
          {secondaryAction ? (
            <View style={styles.actionButtonWrapper}>
              <Button
                variant="secondary"
                size="md"
                onPress={secondaryAction.onPress}
                accessibilityLabel={secondaryAction.label}
              >
                {secondaryAction.label}
              </Button>
            </View>
          ) : null}

          <View style={styles.actionButtonWrapper}>
            <Button
              variant={primaryAction.variant || 'primary'}
              size="md"
              loading={primaryAction.loading}
              onPress={primaryAction.onPress}
              accessibilityLabel={primaryAction.label}
            >
              {primaryAction.label}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
});

Dialog.displayName = 'Dialog';

const styles = StyleSheet.create({
  dialogBody: {
    width: '100%',
  },
  descriptionText: {
    marginBottom: SpacingScale.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SpacingScale.xs,
    marginTop: SpacingScale.sm,
  },
  actionButtonWrapper: {
    minWidth: 90,
  },
});
