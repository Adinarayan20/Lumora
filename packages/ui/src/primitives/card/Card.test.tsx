import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Text } from 'react-native';
import { ThemeProvider } from '@lumora/theme';
import { Card } from './Card';

describe('Card Primitive Deep Contract', () => {
  it('renders static card container across all variants (flat, outlined, elevated)', () => {
    const variants = ['flat', 'outlined', 'elevated'] as const;

    variants.forEach((variant) => {
      const { getByText } = render(
        <ThemeProvider>
          <Card variant={variant} padding="md">
            <Text>{variant} Card Body</Text>
          </Card>
        </ThemeProvider>,
      );
      expect(getByText(`${variant} Card Body`)).toBeTruthy();
    });
  });

  it('renders static card container across all padding scales (none, xs, sm, md, lg)', () => {
    const paddings = ['none', 'xs', 'sm', 'md', 'lg'] as const;

    paddings.forEach((padding) => {
      const { getByText } = render(
        <ThemeProvider>
          <Card padding={padding}>
            <Text>Padding {padding}</Text>
          </Card>
        </ThemeProvider>,
      );
      expect(getByText(`Padding ${padding}`)).toBeTruthy();
    });
  });

  it('renders interactive card with button role only when onPress is provided', () => {
    const handlePress = vi.fn();
    const { getByRole } = render(
      <ThemeProvider>
        <Card variant="interactive" onPress={handlePress}>
          <Text>Clickable Object</Text>
        </Card>
      </ThemeProvider>,
    );

    const cardButton = getByRole('button');
    fireEvent.click(cardButton);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('renders non-interactive static view without button role when onPress is undefined', () => {
    const { queryByRole, getByText } = render(
      <ThemeProvider>
        <Card variant="outlined">
          <Text>Static Non-Interactive Card</Text>
        </Card>
      </ThemeProvider>,
    );

    expect(getByText('Static Non-Interactive Card')).toBeTruthy();
    expect(queryByRole('button')).toBeNull();
  });

  it('handles web keyboard interaction (Space key triggers onPress)', () => {
    const handlePress = vi.fn();
    const { getByRole } = render(
      <ThemeProvider>
        <Card variant="interactive" onPress={handlePress}>
          <Text>Keyboard Card</Text>
        </Card>
      </ThemeProvider>,
    );

    const cardButton = getByRole('button');
    fireEvent.keyDown(cardButton, { key: ' ' });
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('prevents click interaction when disabled is true', () => {
    const handlePress = vi.fn();
    const { getByRole } = render(
      <ThemeProvider>
        <Card variant="interactive" onPress={handlePress} disabled={true}>
          <Text>Disabled Card</Text>
        </Card>
      </ThemeProvider>,
    );

    const cardButton = getByRole('button');
    fireEvent.click(cardButton);
    expect(handlePress).not.toHaveBeenCalled();
  });
});
