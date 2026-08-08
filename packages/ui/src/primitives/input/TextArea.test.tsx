import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { TextArea } from './TextArea';

describe('TextArea Primitive Subsystem', () => {
  it('renders multi-line text area and handles text changes', () => {
    const handleChangeText = vi.fn();
    const { getByDisplayValue } = render(
      <ViewportProvider>
        <ThemeProvider>
          <TextArea
            value="Multi-line Note Content"
            onChangeText={handleChangeText}
            label="Notes"
            numberOfLines={4}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const textArea = getByDisplayValue('Multi-line Note Content');
    expect(textArea).toBeTruthy();

    fireEvent.change(textArea, { target: { value: 'Updated note line 1\nLine 2' } });
    expect(handleChangeText).toHaveBeenCalledWith('Updated note line 1\nLine 2');
  });

  it('renders helper text and label cleanly for multi-line controls', () => {
    const { getByText, getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <TextArea
            value=""
            onChangeText={() => {}}
            label="Detailed Description"
            helperText="Supports multi-line narrative notes"
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    expect(getByText('Detailed Description')).toBeTruthy();
    expect(getByText('Supports multi-line narrative notes')).toBeTruthy();
    expect(getByLabelText('Detailed Description')).toBeTruthy();
  });
});
