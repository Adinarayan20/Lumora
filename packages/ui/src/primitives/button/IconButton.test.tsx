import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { IconButton } from './IconButton';

describe('IconButton Primitive Subsystem', () => {
  it('throws Error in __DEV__ if accessibilityLabel is missing or empty', () => {
    const validOnPress = () => {};
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <IconButton icon="action.delete" onPress={validOnPress} accessibilityLabel="" />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora IconButton Primitive]: IconButton for icon 'action.delete' must provide a valid non-empty 'accessibilityLabel'");

    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <IconButton icon="action.delete" onPress={validOnPress} accessibilityLabel="   " />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora IconButton Primitive]: IconButton for icon 'action.delete' must provide a valid non-empty 'accessibilityLabel'");
  });

  it('throws Error in __DEV__ if onPress is missing', () => {
    const invalidOnPress = undefined as unknown as () => void;
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <IconButton icon="action.delete" accessibilityLabel="Delete item" onPress={invalidOnPress} />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora IconButton Primitive]: IconButton for icon 'action.delete' must provide a valid 'onPress' callback.");
  });

  it('renders IconButton and fires onPress callback when clicked', () => {
    const handlePress = vi.fn();
    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton
            icon="action.delete"
            accessibilityLabel="Delete item from workspace"
            onPress={handlePress}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const iconButton = getByLabelText('Delete item from workspace');
    expect(iconButton).toBeTruthy();

    fireEvent.click(iconButton);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('prevents onPress callback when disabled is true', () => {
    const handlePress = vi.fn();
    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton
            icon="nav.close"
            accessibilityLabel="Close panel"
            disabled={true}
            onPress={handlePress}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const iconButton = getByLabelText('Close panel');
    fireEvent.click(iconButton);
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('prevents onPress callback and renders spinner when loading is true', () => {
    const handlePress = vi.fn();
    const { getByTestId } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton
            icon="nav.close"
            accessibilityLabel="Processing item"
            loading={true}
            onPress={handlePress}
            testID="test-icon-btn"
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const spinner = getByTestId('test-icon-btn-spinner');
    expect(spinner).toBeTruthy();

    fireEvent.click(spinner);
    expect(handlePress).not.toHaveBeenCalled();
  });
});
