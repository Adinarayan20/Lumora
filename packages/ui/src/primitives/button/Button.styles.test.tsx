import { describe, it, expect } from 'vitest';
import { LightThemeColors, RadiusScale, InteractiveTouchTargetMinimum } from '@lumora/theme';
import { resolveButtonStyles } from './Button.styles';

describe('resolveButtonStyles Pure Token Resolver', () => {
  it('resolves primary variant tokens correctly', () => {
    const res = resolveButtonStyles({
      variant: 'primary',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      isTouchMode: true,
    });

    expect(res.textColorToken).toBe('inverse');
    expect(res.iconColorToken).toBe('icon.inverse');
    expect(res.resolvedBackgroundColor).toBe(LightThemeColors.primary);
    expect(res.resolvedBorderWidth).toBe(0);
    expect(res.resolvedOpacity).toBe(1.0);
  });

  it('resolves secondary variant tokens correctly', () => {
    const res = resolveButtonStyles({
      variant: 'secondary',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      isTouchMode: true,
    });

    expect(res.textColorToken).toBe('textPrimary');
    expect(res.iconColorToken).toBe('icon.primary');
    expect(res.resolvedBackgroundColor).toBe(LightThemeColors.surfaceElevated);
    expect(res.resolvedBorderWidth).toBe(0);
  });

  it('resolves outline variant tokens correctly', () => {
    const res = resolveButtonStyles({
      variant: 'outline',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      isTouchMode: true,
    });

    expect(res.textColorToken).toBe('textPrimary');
    expect(res.resolvedBackgroundColor).toBe('transparent');
    expect(res.resolvedBorderWidth).toBe(1);
    expect(res.resolvedBorderColor).toBe(LightThemeColors.border);
  });

  it('resolves ghost variant tokens correctly', () => {
    const res = resolveButtonStyles({
      variant: 'ghost',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      isTouchMode: true,
    });

    expect(res.textColorToken).toBe('textPrimary');
    expect(res.resolvedBackgroundColor).toBe('transparent');
    expect(res.resolvedBorderWidth).toBe(0);
  });

  it('resolves destructive variant tokens correctly', () => {
    const res = resolveButtonStyles({
      variant: 'destructive',
      themeColors: LightThemeColors,
      sizeClass: 'Compact',
      isTouchMode: true,
    });

    expect(res.textColorToken).toBe('inverse');
    expect(res.resolvedBackgroundColor).toBe(LightThemeColors.danger);
  });

  it('resolves small, medium, and large visual dimensions and touch targets', () => {
    const sm = resolveButtonStyles({ size: 'sm', themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });
    const md = resolveButtonStyles({ size: 'md', themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });
    const lg = resolveButtonStyles({ size: 'lg', themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });

    expect(sm.resolvedHeight).toBe(36);
    expect(md.resolvedHeight).toBe(44);
    expect(lg.resolvedHeight).toBe(52);

    expect(sm.touchTargetDimension).toBe(InteractiveTouchTargetMinimum);
    expect(md.touchTargetDimension).toBe(InteractiveTouchTargetMinimum);
    expect(lg.touchTargetDimension).toBe(52);
  });

  it('enforces responsive size contracts when size prop is omitted or explicit', () => {
    // Contextual defaults when size is omitted
    const compactDefault = resolveButtonStyles({ themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });
    const mediumDefault = resolveButtonStyles({ themeColors: LightThemeColors, sizeClass: 'Medium', isTouchMode: true });
    const expandedDefault = resolveButtonStyles({ themeColors: LightThemeColors, sizeClass: 'Expanded', isTouchMode: true });

    expect(compactDefault.resolvedHeight).toBe(44); // md
    expect(mediumDefault.resolvedHeight).toBe(52); // lg
    expect(expandedDefault.resolvedHeight).toBe(52); // lg

    // Explicit size prop overrides viewport defaults unconditionally
    const compactSmall = resolveButtonStyles({ size: 'sm', themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });
    const mediumSmall = resolveButtonStyles({ size: 'sm', themeColors: LightThemeColors, sizeClass: 'Medium', isTouchMode: true });
    const expandedMedium = resolveButtonStyles({ size: 'md', themeColors: LightThemeColors, sizeClass: 'Expanded', isTouchMode: true });
    const anyLarge = resolveButtonStyles({ size: 'lg', themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });

    expect(compactSmall.resolvedHeight).toBe(36);
    expect(mediumSmall.resolvedHeight).toBe(36);
    expect(expandedMedium.resolvedHeight).toBe(44);
    expect(anyLarge.resolvedHeight).toBe(52);
  });

  it('resolves rounded and pill radii', () => {
    const rounded = resolveButtonStyles({ shape: 'rounded', themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });
    const pill = resolveButtonStyles({ shape: 'pill', themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });

    expect(rounded.resolvedRadius).toBe(RadiusScale.md);
    expect(pill.resolvedRadius).toBe(RadiusScale.full);
  });

  it('applies theme disabled opacity when disabled is true', () => {
    const disabled = resolveButtonStyles({ disabled: true, themeColors: LightThemeColors, sizeClass: 'Compact', isTouchMode: true });
    expect(disabled.resolvedOpacity).toBe(LightThemeColors.disabledOpacity);
  });
});
