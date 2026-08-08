import React, { useState, useRef } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme, useViewport, SpacingScale, RadiusScale } from '@lumora/theme';
import { Icon } from '../icon/Icon';
import { Text } from '../typography/Text';
import { FieldControl } from '../field/FieldControl';
import { Popover } from '../overlay/Popover';
import { BottomSheet } from '../overlay/BottomSheet';
import type { OverlayAnchorRect } from '../overlay/Overlay.types';
import type { SelectProps, SelectOption } from './Select.types';
import { resolveSelectStyles } from './Select.styles';

export function Select<T = string>({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select an option',
  helperText,
  errorText,
  size,
  variant = 'default',
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
}: SelectProps<T>): React.ReactElement {
  const { colors } = useTheme();
  const viewport = useViewport();
  const triggerRef = useRef<View>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [anchorRect, setAnchorRect] = useState<OverlayAnchorRect>({ x: 0, y: 0, width: 0, height: 0 });

  const isError = Boolean(errorText);
  const isInteractive = !disabled && !loading;

  // Selected option object (handles unknown / unresolved values gracefully)
  const selectedOption = options.find((opt) => opt.value === value);

  const enabledOptions = options.filter((opt) => !opt.disabled);

  const {
    triggerStyle,
    textStyle,
    resolvedIconGap,
    touchTargetDimension,
  } = resolveSelectStyles({
    variant,
    size,
    themeColors: colors,
    sizeClass: viewport.sizeClass,
    disabled: !isInteractive,
    error: isError,
    isOpen,
  });

  const handleOpen = () => {
    if (!isInteractive) return;

    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setAnchorRect({ x, y, width, height });
        setIsOpen(true);
        setHighlightedIndex(0);
      });
    } else {
      setIsOpen(true);
      setHighlightedIndex(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectOption = (optValue: T) => {
    onChange(optValue);
    handleClose();
  };

  const navigateHighlight = (step: number) => {
    if (options.length === 0) return;

    let nextIndex = highlightedIndex + step;
    while (nextIndex >= 0 && nextIndex < options.length && options[nextIndex].disabled) {
      nextIndex += step;
    }

    if (nextIndex >= 0 && nextIndex < options.length) {
      setHighlightedIndex(nextIndex);
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (Platform.OS !== 'web' || !isInteractive) return;

    if (!isOpen) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleOpen();
      }
    } else {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateHighlight(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateHighlight(-1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const targetOpt = options[highlightedIndex];
        if (targetOpt && !targetOpt.disabled) {
          handleSelectOption(targetOpt.value);
        }
      } else if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault();
        handleClose();
      }
    }
  };

  const effectiveAccessibilityLabel = accessibilityLabel || label || placeholder;
  const isMobileView = viewport.sizeClass === 'Compact';

  const renderOptionItems = () => {
    if (options.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text color="textMuted">No options available</Text>
        </View>
      );
    }

    return options.map((opt, idx) => {
      const isSelected = value === opt.value;
      const isHighlighted = highlightedIndex === idx;
      const isOptionDisabled = Boolean(opt.disabled);

      return (
        <Pressable
          key={String(opt.value)}
          onPress={() => !isOptionDisabled && handleSelectOption(opt.value)}
          disabled={isOptionDisabled}
          accessibilityRole="option"
          accessibilityLabel={opt.label}
          accessibilityState={{
            selected: isSelected,
            disabled: isOptionDisabled,
          }}
          style={[
            styles.optionItem,
            isHighlighted && { backgroundColor: colors.backgroundSecondary },
            isSelected && { backgroundColor: colors.primaryGlow },
            isOptionDisabled && { opacity: colors.disabledOpacity },
          ]}
        >
          <View style={styles.optionLeftBlock}>
            {opt.icon && (
              <View style={{ marginRight: resolvedIconGap }}>
                <Icon name={opt.icon} size="sm" color={isSelected ? 'icon.primary' : 'icon.secondary'} />
              </View>
            )}
            <View style={styles.optionTextBlock}>
              <Text color={isSelected ? 'primary' : isOptionDisabled ? 'textMuted' : 'textPrimary'}>
                {opt.label}
              </Text>
              {opt.description ? (
                <Text role="Caption" color="textMuted">
                  {opt.description}
                </Text>
              ) : null}
            </View>
          </View>

          {isSelected && <Icon name="action.check" size="sm" color="icon.primary" />}
        </Pressable>
      );
    });
  };

  return (
    <FieldControl
      label={label}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
      testID={testID}
    >
      <View ref={triggerRef} style={styles.touchContainer}>
        <Pressable
          onPress={handleOpen}
          onKeyDown={Platform.OS === 'web' ? (handleTriggerKeyDown as any) : undefined}
          disabled={!isInteractive}
          accessibilityRole="combobox"
          accessibilityLabel={effectiveAccessibilityLabel}
          accessibilityState={{
            expanded: isOpen,
            disabled: !isInteractive,
          }}
          testID={testID}
          style={[styles.pressableArea, { minHeight: touchTargetDimension }]}
        >
          <View style={triggerStyle}>
            <Text
              style={[
                textStyle,
                { color: selectedOption ? colors.textPrimary : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </Text>

            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Icon
                name="nav.more"
                size="sm"
                color="icon.secondary"
              />
            )}
          </View>
        </Pressable>
      </View>

      {/* Viewport Adaptive Overlay Presentation */}
      {isMobileView ? (
        <BottomSheet
          visible={isOpen}
          onRequestClose={handleClose}
          title={label || placeholder}
          testID={testID ? `${testID}-sheet` : undefined}
        >
          {renderOptionItems()}
        </BottomSheet>
      ) : (
        <Popover
          visible={isOpen}
          onRequestClose={handleClose}
          anchor={anchorRect}
          testID={testID ? `${testID}-popover` : undefined}
        >
          {renderOptionItems()}
        </Popover>
      )}
    </FieldControl>
  );
}

Select.displayName = 'Select';

const styles = StyleSheet.create({
  touchContainer: {
    width: '100%',
  },
  pressableArea: {
    width: '100%',
    justifyContent: 'center',
  },
  optionItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SpacingScale.xs,
    paddingHorizontal: SpacingScale.sm,
  },
  optionLeftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextBlock: {
    flexDirection: 'column',
    flex: 1,
  },
  emptyContainer: {
    padding: SpacingScale.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
