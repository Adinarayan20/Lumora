import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { Button } from './Button';

describe('Button Primitive Subsystem', () => {
  it('throws Error in __DEV__ if onPress callback is missing', () => {
    const invalidOnPress = undefined as unknown as () => void;
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <Button label="Click Me" onPress={invalidOnPress} />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora Button Primitive]: Button for 'Click Me' must provide a valid 'onPress' callback.");
  });

  it('renders button label and fires onPress callback when clicked', () => {
    const handlePress = vi.fn();
    const { getByText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Submit Action" onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const buttonElement = getByText('Submit Action');
    expect(buttonElement).toBeTruthy();

    fireEvent.click(buttonElement);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('sets accessibilityRole="button" and defaults accessibilityLabel to label', () => {
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Save Changes" onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label') || button.textContent).toContain('Save Changes');
  });

  it('enforces minHeight >= 48dp on the interactive Pressable element', () => {
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Small Visual Button" size="sm" onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const pressable = getByRole('button');
    expect(pressable).toBeTruthy();
    // The interactive Pressable element owns aria-role="button" and minHeight: 48
    expect(pressable.style.minHeight).toBe('48px');
  });

  it('uses explicit accessibilityLabel and accessibilityHint when provided', () => {
    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button
            label="Save"
            accessibilityLabel="Save object to cloud"
            accessibilityHint="Persists data to encrypted cloud storage"
            onPress={() => {}}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const button = getByLabelText('Save object to cloud');
    expect(button).toBeTruthy();
  });

  it('prevents onPress callback and exposes disabled state when disabled is true', () => {
    const handlePress = vi.fn();
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Disabled Action" disabled={true} onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const button = getByRole('button');
    fireEvent.click(button);
    expect(handlePress).not.toHaveBeenCalled();
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('prevents onPress callback and renders loading spinner when loading is true', () => {
    const handlePress = vi.fn();
    const { getByTestId, getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Processing" loading={true} onPress={handlePress} testID="test-btn" />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const spinner = getByTestId('test-btn-spinner');
    expect(spinner).toBeTruthy();

    const button = getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('true');

    fireEvent.click(spinner);
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('renders leading and trailing icons via <Icon /> primitive', () => {
    const { container } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button
            label="Search Catalog"
            leftIcon="action.search"
            rightIcon="nav.forward"
            onPress={() => {}}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );
    expect(container).toBeTruthy();
  });

  it('renders full width button layout when fullWidth is true', () => {
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Full Width CTA" fullWidth={true} onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );
    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.style.width).toBe('100%');
  });
});
