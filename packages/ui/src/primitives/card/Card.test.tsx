import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Text } from 'react-native';
import { ThemeProvider } from '@lumora/theme';
import { Card } from './Card';

describe('Card Primitive Contract', () => {
  it('renders static card container with children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Card variant="outlined" padding="md">
          <Text>Object Card Body</Text>
        </Card>
      </ThemeProvider>,
    );

    expect(getByText('Object Card Body')).toBeTruthy();
  });

  it('renders interactive card and handles click event', () => {
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

  it('handles web keyboard interaction (Space -> onPress)', () => {
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
