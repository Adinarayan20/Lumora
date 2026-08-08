import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@lumora/theme';
import { Toggle } from './Toggle';

describe('Toggle Primitive Contract', () => {
  it('renders switch role and fires onValueChange when pressed', () => {
    const handleValueChange = vi.fn();
    const { getByRole } = render(
      <ThemeProvider>
        <Toggle value={false} onValueChange={handleValueChange} label="Enable notifications" />
      </ThemeProvider>,
    );

    const switchEl = getByRole('switch');
    expect(switchEl).toBeTruthy();
    fireEvent.click(switchEl);
    expect(handleValueChange).toHaveBeenCalledWith(true);
  });

  it('prevents interaction when disabled is true', () => {
    const handleValueChange = vi.fn();
    const { getByRole } = render(
      <ThemeProvider>
        <Toggle value={false} onValueChange={handleValueChange} disabled={true} label="Disabled switch" />
      </ThemeProvider>,
    );

    const switchEl = getByRole('switch');
    fireEvent.click(switchEl);
    expect(handleValueChange).not.toHaveBeenCalled();
  });
});
