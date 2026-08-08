import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, ViewportProvider, LightThemeColors } from '@lumora/theme';
import { Icon } from './Icon';
import { getRegisteredIcon, registerIcon } from './Icon.registry';
import { resolveIconStyles } from './Icon.styles';

describe('Icon Primitive & Registry Subsystem', () => {
  it('resolves foundational icons from semantic registry in O(1)', () => {
    const homeIcon = getRegisteredIcon('nav.home');
    expect(homeIcon.family).toBe('Feather');
    expect(homeIcon.glyph).toBe('home');

    const searchIcon = getRegisteredIcon('action.search');
    expect(searchIcon.glyph).toBe('search');

    const playgroundIcon = getRegisteredIcon('system.playground');
    expect(playgroundIcon.glyph).toBe('flask');
  });

  it('allows dynamic registration of custom domain icons with type safety', () => {
    registerIcon('security.user', { family: 'Feather', glyph: 'user' });
    const lockIcon = getRegisteredIcon('security.user');
    expect(lockIcon.glyph).toBe('user');
  });

  it('throws loud Error if an unregistered semantic icon is requested', () => {
    expect(() => getRegisteredIcon('unregistered.icon' as any)).toThrow(
      "[Lumora Icon Registry]: Icon 'unregistered.icon' is not registered",
    );
  });

  it('resolves semantic theme colors dynamically without raw hex values', () => {
    const primaryStyles = resolveIconStyles({
      color: 'icon.primary',
      themeColors: LightThemeColors,
      themeMode: 'light',
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(primaryStyles.resolvedColor).toBe(LightThemeColors.textPrimary);

    const accentStyles = resolveIconStyles({
      color: 'icon.accent',
      themeColors: LightThemeColors,
      themeMode: 'light',
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(accentStyles.resolvedColor).toBe(LightThemeColors.accent);

    const disabledStyles = resolveIconStyles({
      color: 'icon.disabled',
      themeColors: LightThemeColors,
      themeMode: 'light',
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(disabledStyles.resolvedColor).toBe(LightThemeColors.textMuted);
    expect(disabledStyles.resolvedOpacity).toBe(LightThemeColors.disabledOpacity);
  });

  it('resolves semantic stroke weight without exposing raw numeric props', () => {
    const thinStyles = resolveIconStyles({
      strokeWeight: 'thin',
      themeColors: LightThemeColors,
      themeMode: 'light',
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(thinStyles.resolvedStrokeWidth).toBe(1.25);

    const strongStyles = resolveIconStyles({
      strokeWeight: 'strong',
      themeColors: LightThemeColors,
      themeMode: 'light',
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(strongStyles.resolvedStrokeWidth).toBe(2.25);
  });

  it('throws Error in development if interactive icon (onPress) lacks accessibilityLabel', () => {
    expect(() =>
      render(
        <ViewportProvider>
          <ThemeProvider>
            <Icon name="action.delete" onPress={() => {}} />
          </ThemeProvider>
        </ViewportProvider>,
      ),
    ).toThrow('[Lumora Icon Primitive]: Interactive icon button for \'action.delete\' must provide an explicit \'accessibilityLabel\'');
  });

  it('renders interactive Icon component correctly when accessibilityLabel is provided', () => {
    const { container } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Icon
            name="action.delete"
            onPress={() => {}}
            accessibilityLabel="Delete item from workspace"
          />
        </ThemeProvider>
      </ViewportProvider>,
    );
    expect(container).toBeTruthy();
  });

  it('renders decorative Icon component when onPress is omitted', () => {
    const { container } = render(
      <ViewportProvider>
        <ThemeProvider>
          <Icon name="nav.home" size="md" color="icon.primary" />
        </ThemeProvider>
      </ViewportProvider>,
    );
    expect(container).toBeTruthy();
  });
});
