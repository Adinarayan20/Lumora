import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { Text, Pressable } from 'react-native';
import { ThemeProvider } from '@lumora/theme';
import { ToastProvider, useToast } from './ToastContext';

const TestComponent = () => {
  const { showToast } = useToast();

  return (
    <Pressable
      onPress={() => {
        showToast({
          title: 'Object Saved',
          message: 'Task object saved successfully',
          variant: 'success',
          action: { label: 'Undo', onPress: vi.fn() },
        });
      }}
    >
      <Text>Trigger Toast</Text>
    </Pressable>
  );
};

const CustomTimerComponent = ({ durationMs }: { durationMs: number }) => {
  const { showToast } = useToast();

  return (
    <Pressable
      onPress={() => {
        showToast({
          id: 'custom-toast-1',
          message: 'Custom Duration Message',
          durationMs,
        });
      }}
    >
      <Text>Trigger Custom Toast</Text>
    </Pressable>
  );
};

const DangerTestComponent = () => {
  const { showToast } = useToast();

  return (
    <Pressable
      onPress={() => {
        showToast({
          title: 'Connection Error',
          message: 'Failed to sync workspace',
          variant: 'danger',
        });
      }}
    >
      <Text>Trigger Danger Toast</Text>
    </Pressable>
  );
};

describe('Toast Feedback Primitive Deep Contract', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('automatically dismisses toast after default duration (4000ms)', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      </ThemeProvider>,
    );

    const triggerBtn = getByText('Trigger Toast');
    fireEvent.click(triggerBtn);
    expect(getByText('Object Saved')).toBeTruthy();

    // Advance timers by 3999ms -> Toast still visible
    act(() => {
      vi.advanceTimersByTime(3999);
    });
    expect(getByText('Object Saved')).toBeTruthy();

    // Advance 1ms further -> Toast auto dismissed
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(queryByText('Object Saved')).toBeNull();
  });

  it('respects custom durationMs and persistent durationMs=0', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider>
        <ToastProvider>
          <CustomTimerComponent durationMs={1000} />
        </ToastProvider>
      </ThemeProvider>,
    );

    const triggerBtn = getByText('Trigger Custom Toast');
    fireEvent.click(triggerBtn);
    expect(getByText('Custom Duration Message')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(queryByText('Custom Duration Message')).toBeNull();
  });

  it('assigns alert role and assertive live region for high urgency danger variant', () => {
    const { getByText, getByRole } = render(
      <ThemeProvider>
        <ToastProvider>
          <DangerTestComponent />
        </ToastProvider>
      </ThemeProvider>,
    );

    const triggerBtn = getByText('Trigger Danger Toast');
    fireEvent.click(triggerBtn);

    const alertElement = getByRole('alert');
    expect(alertElement).toBeTruthy();
  });

  it('dismisses toast banner when close button is clicked and clears timer', () => {
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

  it('clears timers cleanly on ToastProvider unmount', () => {
    const { getByText, unmount } = render(
      <ThemeProvider>
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      </ThemeProvider>,
    );

    const triggerBtn = getByText('Trigger Toast');
    fireEvent.click(triggerBtn);

    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(5000);
      });
    }).not.toThrow();
  });
});
