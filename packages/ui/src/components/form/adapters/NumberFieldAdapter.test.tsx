import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { NumberFieldAdapter } from './NumberFieldAdapter';
import type { FieldSchema } from '@lumora/shared';
import { FieldType } from '@lumora/shared';

describe('NumberFieldAdapter Controlled Input Contract', () => {
  const dummySchema: FieldSchema = {
    key: 'quantity',
    label: 'Quantity',
    type: FieldType.NUMBER,
  };

  it('renders initial numeric value as text', () => {
    const handleChange = vi.fn();
    const { getByDisplayValue } = render(
      <ThemeProvider>
        <ViewportProvider>
          <NumberFieldAdapter
            schema={dummySchema}
            value={42}
            onChange={handleChange}
            label="Quantity"
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByDisplayValue('42')).toBeTruthy();
  });

  it('emits parsed number for valid numeric input', () => {
    const handleChange = vi.fn();
    const { getByDisplayValue } = render(
      <ThemeProvider>
        <ViewportProvider>
          <NumberFieldAdapter
            schema={dummySchema}
            value={10}
            onChange={handleChange}
            label="Quantity"
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const input = getByDisplayValue('10');
    fireEvent.change(input, { target: { value: '42.5' } });

    expect(handleChange).toHaveBeenCalledWith(42.5);
  });

  it('emits undefined when input is cleared', () => {
    const handleChange = vi.fn();
    const { getByDisplayValue } = render(
      <ThemeProvider>
        <ViewportProvider>
          <NumberFieldAdapter
            schema={dummySchema}
            value={10}
            onChange={handleChange}
            label="Quantity"
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const input = getByDisplayValue('10');
    fireEvent.change(input, { target: { value: '' } });

    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  it('preserves intermediate string "-" without emitting invalid number', () => {
    const handleChange = vi.fn();
    const { getByDisplayValue } = render(
      <ThemeProvider>
        <ViewportProvider>
          <NumberFieldAdapter
            schema={dummySchema}
            value={5}
            onChange={handleChange}
            label="Quantity"
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    const input = getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '-' } });

    expect(getByDisplayValue('-')).toBeTruthy();
    expect(handleChange).not.toHaveBeenCalledWith(NaN);
  });

  it('synchronizes raw text when value prop changes externally', () => {
    const handleChange = vi.fn();
    const { getByDisplayValue, rerender } = render(
      <ThemeProvider>
        <ViewportProvider>
          <NumberFieldAdapter
            schema={dummySchema}
            value={1}
            onChange={handleChange}
            label="Quantity"
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByDisplayValue('1')).toBeTruthy();

    rerender(
      <ThemeProvider>
        <ViewportProvider>
          <NumberFieldAdapter
            schema={dummySchema}
            value={99}
            onChange={handleChange}
            label="Quantity"
          />
        </ViewportProvider>
      </ThemeProvider>,
    );

    expect(getByDisplayValue('99')).toBeTruthy();
  });
});
