import React, { memo, useEffect } from 'react';
import { Modal, Pressable, View, StyleSheet, Platform } from 'react-native';
import { useTheme, useReducedMotion, OverlayBackdropOpacity } from '@lumora/theme';
import type { OverlayProps } from './Overlay.types';

export const Overlay: React.FC<OverlayProps> = memo(({
  visible,
  onRequestClose,
  children,
  testID,
}) => {
  const { colors } = useTheme();
  const isReducedMotion = useReducedMotion();

  // Escape key handler on Web
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onRequestClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [visible, onRequestClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={isReducedMotion ? 'none' : 'none'}
      onRequestClose={onRequestClose}
      testID={testID}
    >
      <View style={styles.modalRoot}>
        {/* Backdrop Press Dismissal */}
        <Pressable
          style={[
            styles.backdrop,
            {
              backgroundColor: colors.textPrimary,
              opacity: OverlayBackdropOpacity,
            },
          ]}
          onPress={onRequestClose}
          accessibilityRole="button"
          accessibilityLabel="Close overlay menu"
        />

        {/* Content Container */}
        {children}
      </View>
    </Modal>
  );
});

Overlay.displayName = 'Overlay';

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});
