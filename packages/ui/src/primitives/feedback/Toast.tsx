import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  useTheme,
  RadiusScale,
  SpacingScale,
  ToastDimensions,
} from '@lumora/theme';
import { Icon } from '../icon/Icon';
import type { SemanticIconName } from '../icon/Icon.types';
import { Text } from '../typography/Text';
import { IconButton } from '../button/IconButton';
import type { ToastItem } from './Toast.types';

export interface ToastBannerProps {
  readonly toast: ToastItem;
  readonly onDismiss: () => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = memo(({ toast, onDismiss }) => {
  const { colors } = useTheme();

  const variant = toast.variant || 'neutral';

  let iconName: SemanticIconName = 'status.info';
  let borderColor = colors.border;
  let iconColor: 'icon.primary' | 'icon.secondary' | 'status.success' | 'status.warning' | 'status.error' = 'icon.primary';

  switch (variant) {
    case 'success':
      iconName = 'status.success';
      borderColor = colors.success;
      iconColor = 'status.success';
      break;
    case 'warning':
      iconName = 'status.warning';
      borderColor = colors.warning;
      iconColor = 'status.warning';
      break;
    case 'danger':
      iconName = 'status.error';
      borderColor = colors.danger;
      iconColor = 'status.error';
      break;
    case 'info':
      iconName = 'status.info';
      borderColor = colors.info;
      break;
    case 'neutral':
    default:
      iconName = 'status.info';
      borderColor = colors.border;
      break;
  }

  return (
    <View
      style={[
        styles.toastCard,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor,
          maxWidth: ToastDimensions.toastMaxWidth,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={toast.title ? `${toast.title}: ${toast.message}` : toast.message}
    >
      <View style={styles.leftContainer}>
        <View style={styles.iconWrapper}>
          <Icon name={iconName} size="md" color={iconColor} />
        </View>

        <View style={styles.textBlock}>
          {toast.title ? (
            <Text role="Title Medium" color="textPrimary">
              {toast.title}
            </Text>
          ) : null}
          <Text role="Body" color="textSecondary">
            {toast.message}
          </Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        {toast.action ? (
          <Pressable
            onPress={() => {
              toast.action?.onPress();
              onDismiss();
            }}
            accessibilityRole="button"
            accessibilityLabel={toast.action.label}
            style={styles.actionButton}
          >
            <Text role="Button text" color="primary">
              {toast.action.label}
            </Text>
          </Pressable>
        ) : null}

        <IconButton
          icon="nav.close"
          variant="ghost"
          size="sm"
          onPress={onDismiss}
          accessibilityLabel="Dismiss notification"
        />
      </View>
    </View>
  );
});

ToastBanner.displayName = 'ToastBanner';

const styles = StyleSheet.create({
  toastCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SpacingScale.sm,
    borderRadius: RadiusScale.card,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginVertical: SpacingScale.xs,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    marginRight: SpacingScale.xs,
  },
  textBlock: {
    flexDirection: 'column',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SpacingScale.xs,
  },
  actionButton: {
    marginRight: SpacingScale.xs,
    paddingHorizontal: SpacingScale.xs,
    paddingVertical: 4,
  },
});
