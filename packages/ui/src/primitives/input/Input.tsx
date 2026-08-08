import React, { memo, useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme, useViewport, InputMultilineTokens } from '@lumora/theme';
import { Icon } from '../icon/Icon';
import { IconButton } from '../button/IconButton';
import { FieldControl } from '../field/FieldControl';
import type { InputProps } from './Input.types';
import { resolveInputStyles } from './Input.styles';

export const Input: React.FC<InputProps> = memo(({
  value,
  onChangeText,
  label,
  placeholder,
  helperText,
  errorText,
  variant = 'default',
  size,
  shape = 'rounded',
  disabled = false,
  readOnly = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  rightIconAccessibilityLabel,
  accessibilityLabel,
  accessibilityHint,
  testID,
  onFocus,
  onBlur,
  onSubmitEditing,
  keyboardType,
  returnKeyType,
  autoCapitalize = 'none',
  autoCorrect = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines,
  style,
}) => {
  const { colors } = useTheme();
  const viewport = useViewport();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Development Quality Gate: Trailing icon action must provide rightIconAccessibilityLabel
  if (__DEV__ && onRightIconPress && (!rightIconAccessibilityLabel || !rightIconAccessibilityLabel.trim())) {
    throw new Error(
      `[Lumora Input Primitive]: Input for label '${label || placeholder || 'field'}' with onRightIconPress must provide a valid non-empty 'rightIconAccessibilityLabel'.`,
    );
  }

  const isEditable = !disabled && !readOnly;
  const isError = Boolean(errorText);

  // Resolve Styles from Theme Tokens
  const {
    containerStyle,
    inputTextStyle,
    iconColorToken,
    focusRingColor,
    resolvedIconGap,
    resolvedIconSize,
    touchTargetDimension,
  } = resolveInputStyles({
    variant,
    size,
    shape,
    themeColors: colors,
    sizeClass: viewport.sizeClass,
    disabled,
    error: isError,
  });

  const handleFocus = () => {
    if (isEditable) {
      setIsFocused(true);
      onFocus?.();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleContainerPress = () => {
    if (isEditable) {
      inputRef.current?.focus();
    }
  };

  const focusStyle = isFocused && !isError
    ? {
        borderColor: focusRingColor,
      }
    : null;

  const effectiveAccessibilityLabel = accessibilityLabel || label || placeholder || 'Text input field';

  return (
    <FieldControl
      label={label}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
      testID={testID}
    >
      {/* 
        Outer Pressable is a non-focusable touch forwarder to TextInput.
        accessible={false} prevents accessibility tree duplication.
      */}
      <Pressable
        onPress={handleContainerPress}
        disabled={!isEditable}
        accessible={false}
        importantForAccessibility="no"
        testID={testID}
        style={[
          styles.touchableArea,
          {
            minHeight: touchTargetDimension,
          },
        ]}
      >
        <View
          style={[
            containerStyle,
            focusStyle,
            multiline && styles.multilineContainer,
            style,
          ]}
        >
          {/* Leading Icon */}
          {leftIcon && (
            <View style={{ marginRight: resolvedIconGap }}>
              <Icon name={leftIcon} size={resolvedIconSize} color={iconColorToken} />
            </View>
          )}

          {/* Single Authoritative Accessible Native TextInput */}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            editable={isEditable}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={onSubmitEditing}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            numberOfLines={numberOfLines}
            accessibilityLabel={effectiveAccessibilityLabel}
            accessibilityHint={accessibilityHint || helperText || errorText}
            accessibilityState={{
              disabled: disabled || readOnly,
              invalid: isError,
            }}
            testID={testID ? `${testID}-text-input` : undefined}
            style={[inputTextStyle, multiline && styles.multilineInput]}
          />

          {/* Trailing Icon or Action */}
          {rightIcon && (
            <View style={{ marginLeft: resolvedIconGap }}>
              {onRightIconPress ? (
                <IconButton
                  icon={rightIcon}
                  size={resolvedIconSize === 'lg' ? 'md' : 'sm'}
                  variant="ghost"
                  accessibilityLabel={rightIconAccessibilityLabel || 'Input action'}
                  onPress={onRightIconPress}
                  disabled={!isEditable}
                  testID={testID ? `${testID}-right-icon-btn` : undefined}
                />
              ) : (
                <Icon name={rightIcon} size={resolvedIconSize} color={iconColorToken} />
              )}
            </View>
          )}
        </View>
      </Pressable>
    </FieldControl>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  touchableArea: {
    width: '100%',
    justifyContent: 'center',
  },
  multilineContainer: {
    height: 'auto',
    minHeight: InputMultilineTokens.minHeight,
    alignItems: 'flex-start',
    paddingVertical: InputMultilineTokens.paddingVertical,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
});
