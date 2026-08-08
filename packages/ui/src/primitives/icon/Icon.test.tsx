import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, ViewportProvider } from '@lumora/theme';
import { Icon } from './Icon';
import { getRegisteredIcon, registerIcon } from './Icon.registry';
import { resolveIconStyles } from './Icon.styles';
import { LightThemeColors } from '@lumora/theme';

describe('Icon Primitive & Registry', () => {
  it('resolves foundational icons from semantic registry in O(1)', () => {
    const homeIcon = getRegisteredIcon('nav.home');
    expect(homeIcon.family).toBe('Feather');
    expect(homeIcon.glyph).toBe('home');

    const searchIcon = getRegisteredIcon('action.search');
    expect(searchIcon.glyph).toBe('search');

    const backIcon = getRegisteredIcon('nav.back');
    expect(backIcon.autoMirror).toBe(true);
  });

  it('allows dynamic registration of new icon entries without breaking contract', () => {
    registerIcon('security.lock' as any, { family: 'Feather', glyph: 'lock' });
    const lockIcon = getRegisteredIcon('security.lock');
    expect(lockIcon.glyph).toBe('lock');
  });

  it('resolves semantic theme colors dynamically without raw hex', () => {
    const primaryStyles = resolveIconStyles({
      color: 'icon.primary',
      themeColors: LightThemeColors,
      themeMode: 'light',
      sizeClass: 'Compact',
      isTouchMode: true,
    });
    expect(primaryStyles.resolvedColor).toBe(LightThemeColors.textPrimary);

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

  it('renders Icon primitive component without crashing', () => {
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
