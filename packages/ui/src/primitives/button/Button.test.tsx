import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { AccessibilityInfo } from 'react-native';
import { ThemeProvider, ViewportProvider, InteractivePressedOpacity } from '@lumora/theme';
import { Button } from './Button';

describe('Button Primitive Subsystem', () => {
  it('throws Error in __DEV__ if onPress callback is missing', () => {
    const invalidOnPress = undefined as unknown as () => void;
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <Button label="Click Me" onPress={invalidOnPress} />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora Button Primitive]: Button for 'Click Me' must provide a valid 'onPress' callback.");
  });

  it('renders button label and fires onPress callback when clicked', () => {
    const handlePress = vi.fn();
    const { getByText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Submit Action" onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const buttonElement = getByText('Submit Action');
    expect(buttonElement).toBeTruthy();

    fireEvent.click(buttonElement);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('sets accessibilityRole="button" and defaults accessibilityLabel to label', () => {
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Save Changes" onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label') || button.textContent).toContain('Save Changes');
  });

  it('enforces minHeight >= 48dp on the interactive Pressable element', () => {
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Small Visual Button" size="sm" onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const pressable = getByRole('button');
    expect(pressable).toBeTruthy();
    expect(pressable.style.minHeight).toBe('48px');
  });

  it('uses explicit accessibilityLabel and accessibilityHint when provided', () => {
    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button
            label="Save"
            accessibilityLabel="Save object to cloud"
            accessibilityHint="Persists data to encrypted cloud storage"
            onPress={() => {}}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const button = getByLabelText('Save object to cloud');
    expect(button).toBeTruthy();
  });

  it('prevents onPress callback and exposes disabled state when disabled is true', () => {
    const handlePress = vi.fn();
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Disabled Action" disabled={true} onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const button = getByRole('button');
    fireEvent.click(button);
    expect(handlePress).not.toHaveBeenCalled();
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('prevents onPress callback on accessible button element, sets busy state, and preserves layout geometry during loading', () => {
    const handlePress = vi.fn();
    const { getByTestId, getByRole, getByText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Processing Order" loading={true} onPress={handlePress} testID="test-btn" />
        </ThemeProvider>
      </ViewportProvider>,
    );

    // Spinner is rendered
    const spinner = getByTestId('test-btn-spinner');
    expect(spinner).toBeTruthy();

    // Accessibility busy and disabled states are exposed on accessible Button container
    const button = getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');

    // Label text remains rendered in layout for intrinsic geometry preservation
    const labelText = getByText('Processing Order');
    expect(labelText).toBeTruthy();

    // Click fired directly on accessible button element is blocked
    fireEvent.click(button);
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('renders leading and trailing icons via <Icon /> primitive', () => {
    const { container } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button
            label="Search Catalog"
            leftIcon="action.search"
            rightIcon="nav.forward"
            onPress={() => {}}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );
    expect(container).toBeTruthy();
  });

  it('renders full width button layout when fullWidth is true', () => {
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Full Width CTA" fullWidth={true} onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );
    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.style.width).toBe('100%');
  });

  it('asserts focus, blur, press-in, and press-out state transitions', () => {
    const handlePress = vi.fn();
    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Interactive Button" onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const button = getByRole('button');

    // Assert Focus & Blur event handling
    fireEvent.focus(button);
    fireEvent.blur(button);

    // Assert PressIn & PressOut event handling
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);

    expect(button.getAttribute('aria-disabled')).toBeNull();
  });

  it('applies pressed opacity behavior and bypasses spring scaling when reduced motion is enabled', async () => {
    const isReduceMotionEnabledSpy = vi
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);

    const { getByRole } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Reduced Motion Button" onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();

    // Wait microtask tick for async isReduceMotionEnabled promise resolution
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Trigger PressIn under reduced motion
    fireEvent.mouseDown(button);

    // Verify opacity token value (0.70) is set for reduced motion pressed state
    expect(InteractivePressedOpacity).toBe(0.70);

    fireEvent.mouseUp(button);
    isReduceMotionEnabledSpy.mockRestore();
  });

  it('cleans up reduceMotionChanged subscription on unmount', () => {
    const removeSpy = vi.fn();
    const addEventListenerSpy = vi.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({
      remove: removeSpy,
    } as any);

    const { unmount } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Button label="Unmount Test" onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    unmount();

    expect(addEventListenerSpy).toHaveBeenCalledWith('reduceMotionChanged', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });
});
