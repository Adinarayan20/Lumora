import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  useTheme,
  RadiusScale,
  BottomSheetContentMaxHeight,
  SpacingScale,
} from '@lumora/theme';
import { Text } from '../typography/Text';
import { Overlay } from './Overlay';
import type { BottomSheetProps } from './Overlay.types';

export const BottomSheet: React.FC<BottomSheetProps> = memo(({
  visible,
  onRequestClose,
  children,
  title,
  testID,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Overlay visible={visible} onRequestClose={onRequestClose} testID={testID}>
      <View style={styles.sheetWrapper}>
        <View
          style={[
            styles.sheetCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              maxHeight: BottomSheetContentMaxHeight,
            },
          ]}
        >
          {/* Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          {/* Optional Sheet Header Title */}
          {title ? (
            <View style={styles.headerContainer}>
              <Text role="Title Medium" color="textPrimary">
                {title}
              </Text>
            </View>
          ) : null}

          {/* Sheet Body */}
          <View style={styles.bodyContent}>{children}</View>
        </View>
      </View>
    </Overlay>
  );
});

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    width: '100%',
    borderTopLeftRadius: RadiusScale.md,
    borderTopRightRadius: RadiusScale.md,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingBottom: SpacingScale.lg,
    elevation: 16,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: SpacingScale.xs,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: RadiusScale.full,
  },
  headerContainer: {
    paddingHorizontal: SpacingScale.md,
    paddingBottom: SpacingScale.xs,
  },
  bodyContent: {
    paddingHorizontal: SpacingScale.sm,
  },
});
