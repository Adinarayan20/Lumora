import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { AccessibilityInfo } from 'react-native';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { Input } from './Input';

describe('Input Primitive Subsystem', () => {
  it('renders input with value and fires onChangeText callback', () => {
    const handleChangeText = vi.fn();
    const { getByDisplayValue } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Input
            value="Hello Lumora"
            onChangeText={handleChangeText}
            placeholder="Type here..."
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const input = getByDisplayValue('Hello Lumora');
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { value: 'New Lumora Text' } });
    expect(handleChangeText).toHaveBeenCalledWith('New Lumora Text');
  });

  it('renders label, helper text, and links accessibility properties', () => {
    const { getByText, getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Input
            value=""
            onChangeText={() => {}}
            label="User Email"
            helperText="Enter your work email address"
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    expect(getByText('User Email')).toBeTruthy();
    expect(getByText('Enter your work email address')).toBeTruthy();

    const accessibleContainer = getByLabelText('User Email');
    expect(accessibleContainer).toBeTruthy();
  });

  it('renders error text in error state and sets aria-invalid="true"', () => {
    const { getByText, getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Input
            value="Invalid Input"
            onChangeText={() => {}}
            label="Username"
            errorText="Username is already taken"
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    expect(getByText('Username is already taken')).toBeTruthy();
    const accessibleContainer = getByLabelText('Username');
    expect(accessibleContainer.getAttribute('aria-invalid')).toBe('true');
  });

  it('throws Error in __DEV__ if onRightIconPress is provided without rightIconAccessibilityLabel', () => {
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <Input
              value="Secret Password"
              onChangeText={() => {}}
              label="Password"
              rightIcon="nav.close"
              onRightIconPress={() => {}}
              rightIconAccessibilityLabel=""
            />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora Input Primitive]: Input for label 'Password' with onRightIconPress must provide a valid non-empty 'rightIconAccessibilityLabel'.");
  });

  it('executes onRightIconPress callback when right icon button is clicked', () => {
    const handleRightIconPress = vi.fn();
    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Input
            value="Search query"
            onChangeText={() => {}}
            label="Global Search"
            rightIcon="nav.close"
            onRightIconPress={handleRightIconPress}
            rightIconAccessibilityLabel="Clear search text"
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const clearButton = getByLabelText('Clear search text');
    fireEvent.click(clearButton);
    expect(handleRightIconPress).toHaveBeenCalledTimes(1);
  });

  it('disables interactions and sets aria-disabled="true" when disabled is true', () => {
    const handleChangeText = vi.fn();
    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Input
            value="Locked text"
            onChangeText={handleChangeText}
            label="Locked Field"
            disabled={true}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const container = getByLabelText('Locked Field');
    expect(container.getAttribute('aria-disabled')).toBe('true');
  });

  it('handles focus and blur events cleanly', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const { getByDisplayValue } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Input
            value="Focused Field"
            onChangeText={() => {}}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const textInput = getByDisplayValue('Focused Field');
    fireEvent.focus(textInput);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(textInput);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('handles reduced motion mode cleanly', async () => {
    const isReduceMotionEnabledSpy = vi
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);

    const { getByDisplayValue } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Input
            value="Reduced Motion Value"
            onChangeText={() => {}}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const textInput = getByDisplayValue('Reduced Motion Value');
    expect(textInput).toBeTruthy();

    await new Promise((resolve) => setTimeout(resolve, 0));

    fireEvent.focus(textInput);
    fireEvent.blur(textInput);

    isReduceMotionEnabledSpy.mockRestore();
  });
});
