import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Text, Pressable } from 'react-native';
import { ThemeProvider } from '@lumora/theme';
import { ToastProvider, useToast } from './ToastContext';

const TestComponent = ({ onShow }: { onShow?: (id: string) => void }) => {
  const { showToast } = useToast();

  return (
    <Pressable
      onPress={() => {
        const id = showToast({
          title: 'Object Saved',
          message: 'Task object saved successfully',
          variant: 'success',
          action: { label: 'Undo', onPress: vi.fn() },
        });
        if (onShow) onShow(id);
      }}
    >
      <Text>Trigger Toast</Text>
    </Pressable>
  );
};

describe('Toast Feedback Primitive Contract', () => {
  it('renders toast banner when showToast is called', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      </ThemeProvider>,
    );

    expect(queryByText('Object Saved')).toBeNull();

    const triggerBtn = getByText('Trigger Toast');
    fireEvent.click(triggerBtn);

    expect(getByText('Object Saved')).toBeTruthy();
    expect(getByText('Task object saved successfully')).toBeTruthy();
    expect(getByText('Undo')).toBeTruthy();
  });

  it('dismisses toast banner when close button is clicked', () => {
    const { getByText, getByLabelText, queryByText } = render(
      <ThemeProvider>
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      </ThemeProvider>,
    );

    const triggerBtn = getByText('Trigger Toast');
    fireEvent.click(triggerBtn);

    expect(getByText('Object Saved')).toBeTruthy();

    const dismissBtn = getByLabelText('Dismiss notification');
    fireEvent.click(dismissBtn);

    expect(queryByText('Object Saved')).toBeNull();
  });
});
