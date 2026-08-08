import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@lumora/theme';
import { Checkbox } from './Checkbox';

describe('Checkbox Primitive Contract', () => {
  it('renders checkbox role and fires onChange when pressed', () => {
    const handleChange = vi.fn();
    const { getByRole } = render(
      <ThemeProvider>
        <Checkbox checked={false} onChange={handleChange} label="Accept terms" />
      </ThemeProvider>,
    );

    const checkboxEl = getByRole('checkbox');
    expect(checkboxEl).toBeTruthy();
    fireEvent.click(checkboxEl);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('prevents interaction when disabled is true', () => {
    const handleChange = vi.fn();
    const { getByRole } = render(
      <ThemeProvider>
        <Checkbox checked={false} onChange={handleChange} disabled={true} label="Disabled terms" />
      </ThemeProvider>,
    );

    const checkboxEl = getByRole('checkbox');
    fireEvent.click(checkboxEl);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
