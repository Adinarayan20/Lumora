import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { IconButton } from './IconButton';

describe('IconButton Primitive Subsystem', () => {
  it('throws Error in __DEV__ if accessibilityLabel is missing', () => {
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <IconButton icon="action.delete" onPress={() => {}} accessibilityLabel="" />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora IconButton Primitive]: IconButton for icon 'action.delete' must provide an explicit 'accessibilityLabel'");
  });

  it('throws Error in __DEV__ if onPress is missing', () => {
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <IconButton icon="action.delete" accessibilityLabel="Delete item" onPress={undefined as any} />
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
});
