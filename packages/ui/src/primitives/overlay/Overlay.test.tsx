import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Text } from 'react-native';
import { ThemeProvider } from '@lumora/theme';
import { Overlay } from './Overlay';

describe('Overlay Primitive Layer Contract', () => {
  it('renders modal content when visible is true', () => {
    const handleClose = vi.fn();
    const { getByText } = render(
      <ThemeProvider>
        <Overlay visible={true} onRequestClose={handleClose}>
          <Text>Overlay Body Content</Text>
        </Overlay>
      </ThemeProvider>,
    );

    expect(getByText('Overlay Body Content')).toBeTruthy();
  });

  it('fires onRequestClose when backdrop press occurs', () => {
    const handleClose = vi.fn();
    const { getByLabelText } = render(
      <ThemeProvider>
        <Overlay visible={true} onRequestClose={handleClose}>
          <Text>Overlay Body Content</Text>
        </Overlay>
      </ThemeProvider>,
    );

    const backdrop = getByLabelText('Close overlay menu');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
