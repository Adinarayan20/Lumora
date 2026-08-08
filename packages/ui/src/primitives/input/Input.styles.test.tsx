import { describe, it, expect } from 'vitest';
import { LightThemeColors } from '@lumora/theme';
import { resolveInputStyles } from './Input.styles';

describe('resolveInputStyles Token Resolver Contract', () => {
  it('enforces sm, md, lg visual heights, font sizes, and >=48dp touch target minimum', () => {
    const sm = resolveInputStyles({
      size: 'sm',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
    });
    expect(sm.resolvedHeight).toBe(36);
    expect(sm.resolvedFontSize).toBe(14);
    expect(sm.touchTargetDimension).toBe(48);

    const md = resolveInputStyles({
      size: 'md',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
    });
    expect(md.resolvedHeight).toBe(44);
    expect(md.resolvedFontSize).toBe(16);
    expect(md.touchTargetDimension).toBe(48);

    const lg = resolveInputStyles({
      size: 'lg',
      themeColors: LightThemeColors,
      sizeClass: 'Expanded',
    });
    expect(lg.resolvedHeight).toBe(52);
    expect(lg.resolvedFontSize).toBe(18);
    expect(lg.touchTargetDimension).toBe(52);
  });

  it('resolves contextual defaults when size is omitted based on viewport size class', () => {
    const compactDefault = resolveInputStyles({
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
    });
    expect(compactDefault.resolvedHeight).toBe(44);

    const expandedDefault = resolveInputStyles({
      themeColors: LightThemeColors,
      sizeClass: 'Expanded',
    });
    expect(expandedDefault.resolvedHeight).toBe(52);
  });

  it('allows explicit size prop to override contextual viewport default', () => {
    const explicitSmallOnExpanded = resolveInputStyles({
      size: 'sm',
      themeColors: LightThemeColors,
      sizeClass: 'Expanded',
    });
    expect(explicitSmallOnExpanded.resolvedHeight).toBe(36);
  });

  it('applies danger color border when error is true', () => {
    const normal = resolveInputStyles({
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      error: false,
    });
    expect(normal.resolvedBorderColor).toBe(LightThemeColors.border);

    const error = resolveInputStyles({
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      error: true,
    });
    expect(error.resolvedBorderColor).toBe(LightThemeColors.danger);
  });

  it('applies disabled opacity when disabled is true', () => {
    const disabled = resolveInputStyles({
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      disabled: true,
    });
    expect(disabled.resolvedOpacity).toBe(LightThemeColors.disabledOpacity);
  });
});
