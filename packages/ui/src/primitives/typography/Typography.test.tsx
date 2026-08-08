import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { Typography } from './Typography';
import { Heading } from './Heading';
import { Text } from './Text';

describe('Typography Primitive', () => {
  it('renders children with default Body role', () => {
    const { getByText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Text>Hello Lumora</Text>
        </ThemeProvider>
      </ViewportProvider>,
    );

    expect(getByText('Hello Lumora')).toBeTruthy();
  });

  it('renders Heading with semantic role derived from level', () => {
    const { getByText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Heading level={1}>Display Header</Heading>
        </ThemeProvider>
      </ViewportProvider>,
    );

    expect(getByText('Display Header')).toBeTruthy();
  });
});
