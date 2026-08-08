import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { Select } from './Select';

describe('Select Primitive Contract', () => {
  const options = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed', disabled: true },
  ];

  it('renders combobox trigger with placeholder when value is null', () => {
    const handleChange = vi.fn();
    const { getByRole, getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Select value={null} onChange={handleChange} options={options} placeholder="Choose status" />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const combobox = getByRole('combobox');
    expect(combobox).toBeTruthy();
    expect(getByText('Choose status')).toBeTruthy();
  });

  it('displays selected option label when valid value is provided', () => {
    const handleChange = vi.fn();
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Select value="in_progress" onChange={handleChange} options={options} />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('In Progress')).toBeTruthy();
  });

  it('displays placeholder without crashing when value is unknown / unresolved', () => {
    const handleChange = vi.fn();
    const { getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Select value="unknown_status" onChange={handleChange} options={options} placeholder="Choose status" />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByText('Choose status')).toBeTruthy();
  });

  it('opens overlay menu on trigger click and allows selecting an option', () => {
    const handleChange = vi.fn();
    const { getByRole, getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Select value={null} onChange={handleChange} options={options} placeholder="Choose status" />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const combobox = getByRole('combobox');
    fireEvent.click(combobox);

    const optionItem = getByText('Pending');
    expect(optionItem).toBeTruthy();
    fireEvent.click(optionItem);

    expect(handleChange).toHaveBeenCalledWith('pending');
  });

  it('opens menu and selects option via keyboard navigation (Space -> ArrowDown -> Enter)', () => {
    const handleChange = vi.fn();
    const { getByRole, getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Select value={null} onChange={handleChange} options={options} placeholder="Choose status" />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const combobox = getByRole('combobox');

    // Open via Space
    fireEvent.keyDown(combobox, { key: ' ' });
    expect(getByText('Pending')).toBeTruthy();

    // Navigate to next option
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });

    // Select highlighted option via Enter
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalled();
  });

  it('closes menu when Escape key is pressed', () => {
    const handleChange = vi.fn();
    const { getByRole, getByText, queryByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Select value={null} onChange={handleChange} options={options} placeholder="Choose status" />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const combobox = getByRole('combobox');
    fireEvent.click(combobox);
    expect(getByText('Pending')).toBeTruthy();

    // Close via Escape
    fireEvent.keyDown(combobox, { key: 'Escape' });
    expect(queryByText('Pending')).toBeNull();
  });

  it('prevents selection when disabled option is clicked', () => {
    const handleChange = vi.fn();
    const { getByRole, getByText } = render(
      <ThemeProvider>
        <ViewportProvider>
          <Select value={null} onChange={handleChange} options={options} placeholder="Choose status" />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const combobox = getByRole('combobox');
    fireEvent.click(combobox);

    const disabledOptionItem = getByText('Completed');
    fireEvent.click(disabledOptionItem);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
