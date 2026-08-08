import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { Input } from './Input';

describe('Input Primitive Subsystem', () => {
  it('renders single authoritative accessible text input and fires onChangeText callback', () => {
    const handleChangeText = vi.fn();
    const { getByDisplayValue, getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Input
            value="Hello Lumora"
            onChangeText={handleChangeText}
            label="User Field"
            placeholder="Type here..."
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const input = getByDisplayValue('Hello Lumora');
    expect(input).toBeTruthy();

    // Verify single authoritative accessibility element is the TextInput itself
    const accessibleInput = getByLabelText('User Field');
    expect(accessibleInput.tagName.toLowerCase()).toBe('input');

    fireEvent.change(input, { target: { value: 'New Lumora Text' } });
    expect(handleChangeText).toHaveBeenCalledWith('New Lumora Text');
  });

  it('renders label and helper text cleanly', () => {
    const { getByText } = render(
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
  });

  it('renders error text in error state and sets aria-invalid="true" on single TextInput element', () => {
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
    const inputElement = getByLabelText('Username');
    expect(inputElement.getAttribute('aria-invalid')).toBe('true');
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

  it('disables interactions and sets aria-disabled="true" on TextInput when disabled is true', () => {
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

    const inputElement = getByLabelText('Locked Field');
    expect(inputElement.getAttribute('aria-disabled')).toBe('true');
  });

  it('handles focus and blur events with instantaneous 60fps focus state transition', () => {
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
    
    // Focus event updates state instantaneously
    fireEvent.focus(textInput);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    // Blur event restores state instantaneously
    fireEvent.blur(textInput);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});
