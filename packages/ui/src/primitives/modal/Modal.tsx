import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  useTheme,
  RadiusScale,
  SpacingScale,
  ToastDimensions,
} from '@lumora/theme';
import { Text } from '../typography/Text';
import { IconButton } from '../button/IconButton';
import { Overlay } from '../overlay/Overlay';
import type { ModalProps } from './Modal.types';

export const Modal: React.FC<ModalProps> = memo(({
  visible,
  onRequestClose,
  title,
  children,
  testID,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Overlay visible={visible} onRequestClose={onRequestClose} testID={testID}>
      <View style={styles.centerWrapper}>
        <View
          accessibilityRole="dialog"
          accessibilityViewIsModal={true}
          aria-modal={true}
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              shadowColor: colors.textPrimary,
              shadowOffset: ToastDimensions.shadowOffset,
              shadowOpacity: ToastDimensions.shadowOpacity,
              shadowRadius: ToastDimensions.shadowRadius,
              elevation: ToastDimensions.elevation,
              maxWidth: ToastDimensions.modalMaxWidth,
            },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <View style={styles.titleBlock}>
              {title ? (
                <Text role="Title Large" color="textPrimary">
                  {title}
                </Text>
              ) : null}
            </View>

            <IconButton
              icon="nav.close"
              variant="ghost"
              size="sm"
              onPress={onRequestClose}
              accessibilityLabel="Close modal dialog"
            />
          </View>

          {/* Modal Body */}
          <View style={styles.bodyContent}>{children}</View>
        </View>
      </View>
    </Overlay>
  );
});

Modal.displayName = 'Modal';

const styles = StyleSheet.create({
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SpacingScale.md,
  },
  modalCard: {
    width: '100%',
    borderRadius: RadiusScale.card,
    borderWidth: 1,
    padding: SpacingScale.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SpacingScale.sm,
  },
  titleBlock: {
    flex: 1,
  },
  bodyContent: {
    width: '100%',
  },
});
