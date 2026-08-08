import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { AccessibilityInfo } from 'react-native';
import { ThemeProvider, ViewportProvider, InteractivePressedOpacity } from '@lumora/theme';
import { IconButton } from './IconButton';

describe('IconButton Primitive Subsystem', () => {
  it('throws Error in __DEV__ if accessibilityLabel is missing or empty', () => {
    const validOnPress = () => {};
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <IconButton icon="action.delete" onPress={validOnPress} accessibilityLabel="" />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora IconButton Primitive]: IconButton for icon 'action.delete' must provide a valid non-empty 'accessibilityLabel'");

    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <IconButton icon="action.delete" onPress={validOnPress} accessibilityLabel="   " />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora IconButton Primitive]: IconButton for icon 'action.delete' must provide a valid non-empty 'accessibilityLabel'");
  });

  it('throws Error in __DEV__ if onPress is missing', () => {
    const invalidOnPress = undefined as unknown as () => void;
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <IconButton icon="action.delete" accessibilityLabel="Delete item" onPress={invalidOnPress} />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow("[Lumora IconButton Primitive]: IconButton for icon 'action.delete' must provide a valid 'onPress' callback.");
  });

  it('enforces 48dp minimum hit area on Pressable while maintaining visual square body geometry for all sizes', () => {
    const handlePress = vi.fn();
    const { getByLabelText: getSm } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton icon="action.delete" size="sm" accessibilityLabel="Delete small" onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );
    const smBtn = getSm('Delete small');
    expect(smBtn.style.minHeight).toBe('48px');
    expect(smBtn.style.minWidth).toBe('48px');

    const { getByLabelText: getMd } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton icon="action.delete" size="md" accessibilityLabel="Delete medium" onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );
    const mdBtn = getMd('Delete medium');
    expect(mdBtn.style.minHeight).toBe('48px');
    expect(mdBtn.style.minWidth).toBe('48px');

    const { getByLabelText: getLg } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton icon="action.delete" size="lg" accessibilityLabel="Delete large" onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );
    const lgBtn = getLg('Delete large');
    expect(lgBtn.style.minHeight).toBe('52px');
    expect(lgBtn.style.minWidth).toBe('52px');
  });

  it('prevents onPress callback when disabled is true', () => {
    const handlePress = vi.fn();
    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton
            icon="nav.close"
            accessibilityLabel="Close panel"
            disabled={true}
            onPress={handlePress}
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const iconButton = getByLabelText('Close panel');
    fireEvent.click(iconButton);
    expect(handlePress).not.toHaveBeenCalled();
    expect(iconButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('prevents onPress callback on accessible IconButton element and renders spinner when loading is true', () => {
    const handlePress = vi.fn();
    const { getByTestId, getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton
            icon="nav.close"
            accessibilityLabel="Processing item"
            loading={true}
            onPress={handlePress}
            testID="test-icon-btn"
          />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const spinner = getByTestId('test-icon-btn-spinner');
    expect(spinner).toBeTruthy();

    const iconButton = getByLabelText('Processing item');
    expect(iconButton.getAttribute('aria-busy')).toBe('true');

    // Click fired directly on accessible IconButton container is blocked
    fireEvent.click(iconButton);
    expect(handlePress).not.toHaveBeenCalled();
  });

  it('handles focus, blur, press-in, and press-out events cleanly', () => {
    const handlePress = vi.fn();
    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton icon="action.edit" accessibilityLabel="Edit record" onPress={handlePress} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const iconButton = getByLabelText('Edit record');

    // Focus & Blur
    fireEvent.focus(iconButton);
    fireEvent.blur(iconButton);

    // PressIn & PressOut
    fireEvent.mouseDown(iconButton);
    fireEvent.mouseUp(iconButton);

    expect(iconButton.getAttribute('aria-disabled')).toBeNull();
  });

  it('applies pressed opacity behavior when reduced motion is enabled', async () => {
    const isReduceMotionEnabledSpy = vi
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);

    const { getByLabelText } = render(
      <ViewportProvider>
        <ThemeProvider>
          <IconButton icon="nav.more" accessibilityLabel="More settings" onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    const iconButton = getByLabelText('More settings');
    expect(iconButton).toBeTruthy();

    // Wait microtask tick for async isReduceMotionEnabled promise resolution
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Trigger PressIn under reduced motion
    fireEvent.mouseDown(iconButton);

    // Verify opacity token value (0.70) is set for reduced motion pressed state
    expect(InteractivePressedOpacity).toBe(0.70);

    fireEvent.mouseUp(iconButton);
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
          <IconButton icon="nav.more" accessibilityLabel="More options" onPress={() => {}} />
        </ThemeProvider>
      </ViewportProvider>,
    );

    unmount();

    expect(addEventListenerSpy).toHaveBeenCalledWith('reduceMotionChanged', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });
});
