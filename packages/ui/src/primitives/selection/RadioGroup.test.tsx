import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@lumora/theme';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup Primitive Contract', () => {
  const options = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high', disabled: true },
  ];

  it('renders radiogroup and radio roles', () => {
    const handleChange = vi.fn();
    const { getByRole, getAllByRole } = render(
      <ThemeProvider>
        <RadioGroup value="low" onChange={handleChange} options={options} label="Priority Level" />
      </ThemeProvider>,
    );

    expect(getByRole('radiogroup')).toBeTruthy();
    const radioItems = getAllByRole('radio');
    expect(radioItems.length).toBe(3);
  });

  it('fires onChange when unselected option is clicked', () => {
    const handleChange = vi.fn();
    const { getAllByRole } = render(
      <ThemeProvider>
        <RadioGroup value="low" onChange={handleChange} options={options} label="Priority Level" />
      </ThemeProvider>,
    );

    const radioItems = getAllByRole('radio');
    fireEvent.click(radioItems[1]); // Medium option
    expect(handleChange).toHaveBeenCalledWith('medium');
  });

  it('prevents selection on disabled option', () => {
    const handleChange = vi.fn();
    const { getAllByRole } = render(
      <ThemeProvider>
        <RadioGroup value="low" onChange={handleChange} options={options} label="Priority Level" />
      </ThemeProvider>,
    );

    const radioItems = getAllByRole('radio');
    fireEvent.click(radioItems[2]); // High (disabled) option
    expect(handleChange).not.toHaveBeenCalled();
  });
});
