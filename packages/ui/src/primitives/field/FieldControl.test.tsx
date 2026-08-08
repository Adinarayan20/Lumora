import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Text } from 'react-native';
import { ThemeProvider } from '@lumora/theme';
import { FieldControl } from './FieldControl';

describe('FieldControl Primitive Helper', () => {
  it('renders children with label and helper text', () => {
    const { getByText } = render(
      <ThemeProvider>
        <FieldControl label="Custom Field" helperText="Helper text description">
          <Text>Field Body Content</Text>
        </FieldControl>
      </ThemeProvider>,
    );

    expect(getByText('Custom Field')).toBeTruthy();
    expect(getByText('Helper text description')).toBeTruthy();
    expect(getByText('Field Body Content')).toBeTruthy();
  });

  it('replaces helper text with error text when errorText is provided', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <FieldControl
          label="Custom Field"
          helperText="Helper text description"
          errorText="Validation error message"
        >
          <Text>Field Body Content</Text>
        </FieldControl>
      </ThemeProvider>,
    );

    expect(getByText('Validation error message')).toBeTruthy();
    expect(queryByText('Helper text description')).toBeNull();
  });
});
