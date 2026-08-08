import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, ViewportProvider, LightThemeColors } from '@lumora/theme';
import { Icon } from './Icon';
import { getRegisteredIcon, registerDomainIcon, replaceDomainIcon } from './Icon.registry';
import { resolveIconStyles } from './Icon.styles';

describe('Icon Primitive & Registry Subsystem Hardening', () => {
  it('resolves core semantic icons from core registry in O(1)', () => {
    const homeIcon = getRegisteredIcon('nav.home');
    expect(homeIcon.family).toBe('Feather');
    expect(homeIcon.glyph).toBe('home');

    const playgroundIcon = getRegisteredIcon('system.playground');
    expect(playgroundIcon.glyph).toBe('flask');
  });

  it('allows dynamic registration of domain extension icons via registerDomainIcon with ext: typing', () => {
    registerDomainIcon('ext:medical.pill', { family: 'Feather', glyph: 'activity' });
    const domainIcon = getRegisteredIcon('ext:medical.pill');
    expect(domainIcon.glyph).toBe('activity');
  });

  it('prevents duplicate domain extension registration and supports explicit replaceDomainIcon', () => {
    expect(() =>
      registerDomainIcon('ext:medical.pill', { family: 'Feather', glyph: 'activity' }),
    ).toThrow("[Lumora Icon Registry]: Extension icon 'ext:medical.pill' is already registered.");

    replaceDomainIcon('ext:medical.pill', { family: 'Feather', glyph: 'heart' });
    expect(getRegisteredIcon('ext:medical.pill').glyph).toBe('heart');
  });

  it('throws loud Error when an unregistered icon is requested', () => {
    // Intentional negative test verifying runtime error throw on invalid key
    expect(() => getRegisteredIcon('unregistered.invalid')).toThrow(
      "[Lumora Icon Registry]: Icon 'unregistered.invalid' is not registered",
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

  describe('Complete 11-Case Accessibility State Machine Contract Matrix', () => {
    it('1. auto mode + no onPress + no label -> renders decorative icon', () => {
      const { container } = render(
        <ViewportProvider>
          <ThemeProvider>
            <Icon name="nav.home" />
          </ThemeProvider>
        </ViewportProvider>,
      );
      expect(container).toBeTruthy();
    });

    it('2. auto mode + no onPress + label -> renders informative icon', () => {
      const { container } = render(
        <ViewportProvider>
          <ThemeProvider>
            <Icon name="status.warning" accessibilityLabel="System Warning Indicator" />
          </ThemeProvider>
        </ViewportProvider>,
      );
      expect(container).toBeTruthy();
    });

    it('3. auto mode + onPress + no label -> throws Error in __DEV__', () => {
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

    it('4. auto mode + onPress + label -> renders interactive icon button', () => {
      const { container } = render(
        <ViewportProvider>
          <ThemeProvider>
            <Icon name="action.delete" onPress={() => {}} accessibilityLabel="Delete workspace item" />
          </ThemeProvider>
        </ViewportProvider>,
      );
      expect(container).toBeTruthy();
    });

    it('5. explicit decorative + no onPress -> renders decorative icon', () => {
      const { container } = render(
        <ViewportProvider>
          <ThemeProvider>
            <Icon name="nav.home" accessibilityMode="decorative" />
          </ThemeProvider>
        </ViewportProvider>,
      );
      expect(container).toBeTruthy();
    });

    it('6. explicit informative + label -> renders informative icon', () => {
      const { container } = render(
        <ViewportProvider>
          <ThemeProvider>
            <Icon name="status.success" accessibilityMode="informative" accessibilityLabel="Operation completed successfully" />
          </ThemeProvider>
        </ViewportProvider>,
      );
      expect(container).toBeTruthy();
    });

    it('7. explicit interactive + onPress + label -> renders interactive icon button', () => {
      const { container } = render(
        <ViewportProvider>
          <ThemeProvider>
            <Icon
              name="action.search"
              accessibilityMode="interactive"
              onPress={() => {}}
              accessibilityLabel="Search catalog"
            />
          </ThemeProvider>
        </ViewportProvider>,
      );
      expect(container).toBeTruthy();
    });

    it('8. explicit interactive + no onPress -> throws Error in __DEV__', () => {
      expect(() =>
        render(
          <ViewportProvider>
            <ThemeProvider>
              <Icon name="action.search" accessibilityMode="interactive" accessibilityLabel="Search catalog" />
            </ThemeProvider>
          </ViewportProvider>,
        ),
      ).toThrow("[Lumora Icon Primitive]: Icon 'action.search' with explicit accessibilityMode=\"interactive\" must provide an 'onPress' handler.");
    });

    it('9. explicit decorative + onPress -> throws Error in __DEV__', () => {
      expect(() =>
        render(
          <ViewportProvider>
            <ThemeProvider>
              <Icon name="action.search" accessibilityMode="decorative" onPress={() => {}} />
            </ThemeProvider>
          </ViewportProvider>,
        ),
      ).toThrow("[Lumora Icon Primitive]: Decorative icon 'action.search' cannot accept an 'onPress' handler.");
    });

    it('10. explicit informative + onPress -> throws Error in __DEV__', () => {
      expect(() =>
        render(
          <ViewportProvider>
            <ThemeProvider>
              <Icon name="status.info" accessibilityMode="informative" onPress={() => {}} accessibilityLabel="Info" />
            </ThemeProvider>
          </ViewportProvider>,
        ),
      ).toThrow("[Lumora Icon Primitive]: Informational icon 'status.info' cannot accept an 'onPress' handler.");
    });

    it('11. explicit informative + missing label -> throws Error in __DEV__', () => {
      expect(() =>
        render(
          <ViewportProvider>
            <ThemeProvider>
              <Icon name="status.info" accessibilityMode="informative" />
            </ThemeProvider>
          </ViewportProvider>,
        ),
      ).toThrow("[Lumora Icon Primitive]: Informational icon 'status.info' must provide an explicit 'accessibilityLabel'.");
    });
  });
});
