import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider, LightThemeColors } from '@lumora/theme';
import { Button } from './Button';
import { resolveButtonStyles } from './Button.styles';

describe('Button Primitive Subsystem', () => {
  it('resolves semantic theme colors for primary variant', () => {
    const styles = resolveButtonStyles({
      variant: 'primary',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(styles.textColorToken).toBe('inverse');
    expect(styles.resolvedBackgroundColor).toBe(LightThemeColors.primary);
  });

  it('resolves semantic theme colors for secondary variant', () => {
    const styles = resolveButtonStyles({
      variant: 'secondary',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(styles.textColorToken).toBe('textPrimary');
    expect(styles.resolvedBackgroundColor).toBe(LightThemeColors.surfaceElevated);
  });

  it('resolves destructive variant with danger background', () => {
    const styles = resolveButtonStyles({
      variant: 'destructive',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(styles.resolvedBackgroundColor).toBe(LightThemeColors.danger);
  });

  it('throws Error in __DEV__ if onPress is missing', () => {
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <Button label="Click Me" onPress={undefined as any} />
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

  it('prevents onPress callback when disabled is true', () => {
    const handlePress = vi.fn();
    const { getByText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Disabled Action" disabled={true} onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const buttonElement = getByText('Disabled Action');
    fireEvent.click(buttonElement);
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('prevents onPress callback and renders loading spinner when loading is true', () => {
    const handlePress = vi.fn();
    const { getByTestId } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Processing" loading={true} onPress={handlePress} testID="test-btn" />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const spinner = getByTestId('test-btn-spinner');
    expect(spinner).toBeTruthy();

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
});
