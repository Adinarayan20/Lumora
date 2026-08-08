import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@lumora/theme';
import { Badge } from './Badge';

describe('Badge Primitive Contract', () => {
  it('renders badge content with neutral variant by default', () => {
    const { getByText, getByRole } = render(
      <ThemeProvider>
        <Badge>Active Status</Badge>
      </ThemeProvider>,
    );

    expect(getByText('Active Status')).toBeTruthy();
    expect(getByRole('text')).toBeTruthy();
  });

  it('renders icon and text when icon prop is provided', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Badge variant="success" icon="status.success">
          Completed
        </Badge>
      </ThemeProvider>,
    );

    expect(getByText('Completed')).toBeTruthy();
  });

  it('applies custom testID and accessibility label', () => {
    const { getByTestId, getByLabelText } = render(
      <ThemeProvider>
        <Badge variant="warning" testID="priority-badge" accessibilityLabel="High priority task">
          High
        </Badge>
      </ThemeProvider>,
    );

    expect(getByTestId('priority-badge')).toBeTruthy();
    expect(getByLabelText('High priority task')).toBeTruthy();
  });
});
