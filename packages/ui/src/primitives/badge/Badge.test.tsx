import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@lumora/theme';
import { Badge } from './Badge';

describe('Badge Primitive Deep Contract', () => {
  it('renders badge content across all semantic variants', () => {
    const variants = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;

    variants.forEach((variant) => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge variant={variant}>{variant.toUpperCase()}</Badge>
        </ThemeProvider>,
      );
      expect(getByText(variant.toUpperCase())).toBeTruthy();
    });
  });

  it('renders badge across all size scales (sm, md, lg)', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      const { getByText } = render(
        <ThemeProvider>
          <Badge size={size}>{size.toUpperCase()}</Badge>
        </ThemeProvider>,
      );
      expect(getByText(size.toUpperCase())).toBeTruthy();
    });
  });

  it('renders icon and text when icon prop is provided', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Badge variant="success" icon="status.success">
          Completed Task
        </Badge>
      </ThemeProvider>,
    );

    expect(getByText('Completed Task')).toBeTruthy();
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
